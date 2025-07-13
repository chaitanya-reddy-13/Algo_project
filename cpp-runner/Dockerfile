FROM gcc:latest

COPY run.sh /usr/local/bin/run.sh
RUN chmod +x /usr/local/bin/run.sh

WORKDIR /app/user
CMD ["/usr/local/bin/run.sh"]
