FROM mysql:8

ENV MYSQL_DATABASE=devsite_db
ENV MYSQL_USER=devsite_user

COPY my.cnf /etc/mysql/conf.d/
COPY migrations/ /migrations/
COPY run-migrations.sh /run-migrations.sh

RUN chmod +x /run-migrations.sh 

ENTRYPOINT ["/run-migrations.sh"]