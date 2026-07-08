def test_get_activities(client):
    res = client.get("/activities")
    assert res.status_code == 200
    data = res.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data


def test_signup_adds_participant(client):
    email = "newstudent@EXAMPLE.com"
    # signup (TestClient will URL-encode automatically when using params)
    res = client.post(f"/activities/Chess%20Club/signup", params={"email": email})
    assert res.status_code == 200

    data = client.get("/activities").json()
    participants = data["Chess Club"]["participants"]
    assert email.strip().lower() in participants


def test_duplicate_signup_returns_400(client):
    # michael@mergington.edu already exists in initial data
    res = client.post(f"/activities/Chess%20Club/signup", params={"email": "michael@mergington.edu"})
    assert res.status_code == 400


def test_remove_participant(client):
    # ensure participant exists
    data = client.get("/activities").json()
    assert "michael@mergington.edu" in data["Chess Club"]["participants"]

    res = client.delete(f"/activities/Chess%20Club/participants", params={"email": "michael@mergington.edu"})
    assert res.status_code == 200

    data_after = client.get("/activities").json()
    assert "michael@mergington.edu" not in data_after["Chess Club"]["participants"]


def test_remove_nonexistent_participant_returns_404(client):
    res = client.delete(f"/activities/Chess%20Club/participants", params={"email": "noone@nowhere.test"})
    assert res.status_code == 404


def test_signup_normalization_and_duplicate_prevention(client):
    email_upper = "AnotherUser@Example.COM"
    # first signup should succeed
    res1 = client.post(f"/activities/Gym%20Class/signup", params={"email": email_upper})
    assert res1.status_code == 200

    # second signup with lower-case should be considered duplicate
    res2 = client.post(f"/activities/Gym%20Class/signup", params={"email": email_upper.lower()})
    assert res2.status_code == 400
