python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python manage.py makemigrations

python manage.py migrate

python manage.py runserver

python manage.py createsuperuser

http://127.0.0.1:8000/

thiago@example.com / password1234

gemini@example.com / password4321

admin / admin@example.com / adminpassword