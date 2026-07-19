import os

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev_default_secret_key_change_in_prod')
    DEBUG = False
    TESTING = False
    PORT = int(os.environ.get("PORT", 5000))

class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True

class TestingConfig(Config):
    """Testing configuration."""
    TESTING = True
    DEBUG = True

class ProductionConfig(Config):
    """Production configuration."""
    # Production must set SECRET_KEY in environment
    DEBUG = False
    TESTING = False

# Mapping of configurations
config_by_name = {
    "dev": DevelopmentConfig,
    "test": TestingConfig,
    "prod": ProductionConfig
}

# Active configuration defaults to development
config = config_by_name[os.environ.get('FLASK_ENV', 'dev')]
