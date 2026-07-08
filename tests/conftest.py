from copy import deepcopy
import pytest
from fastapi.testclient import TestClient

import src.app as app_module


# Preserve original activities state to restore between tests
ORIGINAL_ACTIVITIES = deepcopy(app_module.activities)


@pytest.fixture(autouse=True)
def reset_activities():
    # Reset module-level activities before each test
    app_module.activities = deepcopy(ORIGINAL_ACTIVITIES)
    yield
    app_module.activities = deepcopy(ORIGINAL_ACTIVITIES)


@pytest.fixture
def client():
    return TestClient(app_module.app)
