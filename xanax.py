import io
import cv2
import numpy as np
from flask import Flask, request, send_file, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/correct/*": {"origins": "*"}})

# Simulation matrices
SIM_MATS = {
    "protanopia": np.array([
        [0.56667, 0.43333, 0.0],
        [0.55833, 0.44167, 0.0],
        [0.0,     0.24167, 0.75833],
    ]),
    "deuteranopia": np.array([
        [0.625, 0.375, 0.0],
        [0.7,   0.3,   0.0],
        [0.0,   0.3,   0.7],
    ]),
    "tritanopia": np.array([
        [0.95,  0.05,   0.0],
        [0.0,   0.433,  0.567],
        [0.0,   0.475,  0.525],
    ]),
}

# Daltonization (error‐adding) matrices
DALT_MATS = {
    "protanopia": np.array([
        [0.0,      2.02344, -2.52581],
        [0.0,      1.0,      0.0    ],
        [0.0,      0.0,      1.0    ],
    ]),
    "deuteranopia": np.array([
        [1.0,      0.0,      0.0    ],
        [0.494207, 0.0,      1.24827],
        [0.0,      0.0,      1.0    ],
    ]),
    "tritanopia": np.array([
        [1.0,       0.0,       0.0     ],
        [0.0,       1.0,       0.0     ],
        [-0.395913, 0.801109,  0.0     ],
    ]),
}

def transform_image(img: np.ndarray, mat: np.ndarray) -> np.ndarray:
    """
    Apply a 3×3 matrix to an RGB image (in [0..255] uint8).
    Returns a uint8 image clipped to [0..255].
    """
    f = img.astype(np.float32) / 255.0
    t = np.dot(f, mat.T)
    t = np.clip(t, 0.0, 1.0)
    return (t * 255.0).astype(np.uint8)

def color_recolor(img_rgb: np.ndarray,
                  sim: np.ndarray,
                  dalt: np.ndarray) -> np.ndarray:
    """
    1) simulate deficiency on the original,
    2) apply daltonization to original,
    3) recolor the daltonized via the simulate matrix.
    Returns only the final “recolored” uint8 RGB image.
    """
    # img_sim = transform_image(img_rgb, sim)       # optional output
    img_dalton = transform_image(img_rgb, dalt)
    img_rec = transform_image(img_dalton, sim)
    return img_rec

@app.route('/')
def index():
    return jsonify({
        "message": (
            "CVD Recolorization API. POST to "
            "/correct/<deficiency>?strength ignored "
            "with form‑file 'image'."
        )
    })

@app.route('/correct/<deficiency>', methods=['POST'])
def correct_image(deficiency):
    if deficiency not in SIM_MATS:
        return jsonify({
            "error": ("Invalid deficiency, choose from "
                      f"{list(SIM_MATS.keys())}")
        }), 400

    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    # Read image
    file = request.files['image']
    data = np.frombuffer(file.read(), dtype=np.uint8)
    img_bgr = cv2.imdecode(data, cv2.IMREAD_COLOR)
    if img_bgr is None:
        return jsonify({"error": "Cannot decode image"}), 400

    # Convert & recolor
    img_rgb = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2RGB)
    sim_mat = SIM_MATS[deficiency]
    dalt_mat = DALT_MATS[deficiency]
    out_rgb = color_recolor(img_rgb, sim_mat, dalt_mat)

    # Back to BGR for OpenCV encoding
    out_bgr = cv2.cvtColor(out_rgb, cv2.COLOR_RGB2BGR)
    _, buf = cv2.imencode('.png', out_bgr)

    return send_file(
        io.BytesIO(buf.tobytes()),
        mimetype='image/png',
        as_attachment=True,
        download_name='recolored.png'
    )

if __name__ == '__main__':
    # Debug on 0.0.0.0:5000
    app.run(host='0.0.0.0', port=5000, debug=True)
