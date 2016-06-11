FROM python:3-onbuild

# Copy the application folder inside the container
ADD ./news.py /usr/src/app/newsapp/

# Expose ports
EXPOSE 5000

# Set the default directory where CMD will execute
WORKDIR /usr/src/app/newsapp

# Set the default command to execute    
# when creating a new container
CMD python news.py
