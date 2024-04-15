from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.ensemble import RandomForestClassifier
import numpy as np

app = Flask(__name__)
CORS(app)

# 创建一个随机的训练数据集和模型
X = np.array([[0, 0], [1, 1]])
y = np.array([0, 1])
model = RandomForestClassifier()
model.fit(X, y)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = np.array(data['features']).reshape(1, -1)
    prediction = model.predict(features)
    return jsonify({'prediction': prediction.tolist()})

if __name__ == '__main__':
    app.run()
