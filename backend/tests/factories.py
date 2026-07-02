import factory
from app.models.user import User

class UserFactory(factory.Factory):
    class Meta:
        model = User
    email = factory.Sequence(lambda n: f"user{n}@example.com")
    password_hash = "$2b$10$..."
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
