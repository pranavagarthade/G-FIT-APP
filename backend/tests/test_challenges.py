import hashlib
import hmac

from app import challenges


def test_razorpay_payment_signature(monkeypatch):
    monkeypatch.setattr(challenges.settings, "razorpay_key_secret", "test-secret")
    message = "order_123|pay_123"
    signature = hmac.new(b"test-secret", message.encode(), hashlib.sha256).hexdigest()

    assert challenges.verify_razorpay_signature("order_123", "pay_123", signature)
    assert not challenges.verify_razorpay_signature("order_123", "pay_other", signature)


def test_webhook_signature_rejects_missing_secret(monkeypatch):
    monkeypatch.setattr(challenges.settings, "razorpay_webhook_secret", "")

    assert not challenges.verify_webhook_signature(b"{}", "anything")


def test_webhook_event_id_is_stable():
    payload = b'{"event":"payment.captured"}'

    assert challenges.webhook_event_id(payload) == hashlib.sha256(payload).hexdigest()
