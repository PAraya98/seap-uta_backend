FROM linuxserver/openssh-server
ENV PUID=1000
ENV USER_NAME=seap-uta
ENV SUDO_ACCESS=true
ENV USER_PASSWORD=1234
ENV PGID=1000
ENV PASSWORD_ACCESS=true
ENV TZ=Europe/London
RUN apk add gcc && apk add libc-dev && apk add py3-pip && apk add nodejs
RUN mkdir /config/seap_virtual
RUN useradd seap-uta
RUN usermod -d /config/seap_virtual seap-uta