# Flask settings
FLASK_ADDRESS = '0.0.0.0' # 0.0.0.0 is used as default address and it will make your server visible with your machine's IP address
FLASK_PORT = 8888 
FLASK_DEBUG = True  # Do not use debug mode in production

# Flask-Restplus settings
RESTPLUS_SWAGGER_UI_DOC_EXPANSION = 'list'
RESTPLUS_VALIDATE = True
RESTPLUS_MASK_SWAGGER = False
RESTPLUS_ERROR_404_HELP = False

# MongoDB Settings
MONGO_URI = 'mongodb://192.168.1.115:27017/globalStatus'

# MQTT Settings
MQTT_ADDRESS = '192.168.1.115'
MQTT_PORT = 1883
MQTT_TIMEOUT = 60


