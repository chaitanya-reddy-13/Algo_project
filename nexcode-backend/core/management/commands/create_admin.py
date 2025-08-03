from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create a default admin user for production'

    def handle(self, *args, **options):
        if not User.objects.filter(username='admin').exists():
            user = User.objects.create_superuser(
                username='admin',
                email='admin@AlgoArena.com',
                password='admin123',
                role='Admin'
            )
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created admin user: {user.username}')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Admin user already exists')
            ) 