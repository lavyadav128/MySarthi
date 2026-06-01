import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

sender_email= "priyanka369runa97531@gmail.com"
app_password="sdpsqcvdjdcstrtr"

# Receiver email
receiver_email = "priyanka.cs.ds@gmail.com"

# Create email
subject = "Test Email"
body = "Hello! This email was sent using Python."

message = MIMEMultipart()
message["From"] = sender_email
message["To"] = receiver_email
message["Subject"] = subject

message.attach(MIMEText(body, "plain"))

try:
    # Connect to Gmail SMTP server
    server = smtplib.SMTP("smtp.gmail.com", 587)
    server.starttls()

    # Login
    server.login(sender_email, app_password)

    # Send email
    server.sendmail(sender_email, receiver_email, message.as_string())

    print("Email sent successfully!")

except Exception as e:
    print("Error:", e)

finally:
    server.quit()