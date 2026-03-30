import logging
import os
from pathlib import Path
from dotenv import load_dotenv
from garminconnect import Garmin
from garminconnect import GarminConnectAuthenticationError
from garth.exc import GarthHTTPError

# Load environment variables
load_dotenv(Path(__file__).parent.parent.parent / '.env.local')
logger = logging.getLogger(__name__)

# Persistent token storage (home directory, survives reboots / ephemeral containers)
GARTH_HOME = Path.home() / ".garminconnect"
GARTH_HOME.mkdir(exist_ok=True)


def get_garmin_client() -> Garmin:
    """
    Initialize Garmin client safely.
    - Reuse cached tokens if available.
    - Login with credentials only if necessary.
    - Avoid repeated logins to prevent 429 errors.
    """
    email = os.getenv("GARMIN_EMAIL")
    password = os.getenv("GARMIN_PASSWORD")

    # Step 1: Initialize empty client (no login yet)
    client = Garmin()

    # Step 2: Try to login with tokenstore
    try:
        client.login(tokenstore=GARTH_HOME)
        logger.info("Garmin: resumed session from cached tokens")
        return client
    except (FileNotFoundError, GarminConnectAuthenticationError, GarthHTTPError) as e:
        logger.info("Garmin: token reuse failed, performing full login")

    # Step 3: Full login with email/password
    if not email or not password:
        raise RuntimeError(
            "GARMIN_EMAIL and GARMIN_PASSWORD must be set for first-time login")

    client = Garmin(email=email, password=password)
    try:
        client.login()
        # Persist tokens for future runs
        client.garth.dump(GARTH_HOME)
        logger.info(
            "Garmin: full login successful, tokens stored at %s", GARTH_HOME)
    except Exception as e:
        logger.error("Garmin full login failed: %s", repr(e))
        raise RuntimeError(
            "Garmin login failed — check GARMIN_EMAIL and GARMIN_PASSWORD"
        ) from e

    return client
