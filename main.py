from flask import Flask
from flask_mail import Mail
from dotenv import load_dotenv
import os

from views import views
from auth import auth



load_dotenv()

app = Flask(__name__)


ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

app.config["SECRET_KEY"] = os.getenv('SECRET_KEY')
app.config['MONGO_URI'] = os.getenv('MONGO_URI')
app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER')

app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT'))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS') == 'True'



app.register_blueprint(views)
app.register_blueprint(auth)
mail = Mail(app)



if __name__ == "__main__":
    app.run(host='0.0.0.0', debug=True, port=9119)