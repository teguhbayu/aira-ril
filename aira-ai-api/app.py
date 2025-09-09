
from flask import Flask, request, jsonify, json
import model
from flask_cors import CORS

app = Flask(__name__)
CORS(app, origins=["*"])

@app.route("/", methods=["POST"])
def hello():
    if request.method == "POST":
        data = request.json
        return json.dumps({
            "status":200,
            "message":"success",
            "data":{
                "predicted_v":model.predict_v(valve_pos=data["valve_pos"], water_lev=data["water_level"])
            }
        })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)