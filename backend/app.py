from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({"message": "Hello from Flask!"})

@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.get_json()
    if 'inputValue' in data:
        input_value = data['inputValue']
        try:
            input_value = float(input_value)
            doubled_value = input_value * 2
            return jsonify({"message": "Data received!", "doubled_value": doubled_value})
        except ValueError:
            return jsonify({"message": "Invalid input. Please send a number."}), 400
    else:
        return jsonify({"message": "No input value provided."}), 400

if __name__ == '__main__':
    app.run(debug=True)
