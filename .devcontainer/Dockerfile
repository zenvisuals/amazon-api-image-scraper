ARG DEVCONTAINER_OS="ubuntu-22.04"
FROM mcr.microsoft.com/devcontainers/base:${DEVCONTAINER_OS}

ENV WORKSPACE="/workspace"
WORKDIR ${WORKSPACE}

ARG USERNAME="vscode"
USER $USERNAME
ENV HOME_PATH=/home/${USERNAME}

RUN git clone https://github.com/zsh-users/zsh-autosuggestions ${HOME_PATH}/.oh-my-zsh/custom/plugins/zsh-autosuggestions \
    && git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ${HOME_PATH}/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting

COPY .zshrc ${HOME_PATH}/
COPY ./postAttachCommand.sh /postAttachCommand.sh
RUN sudo chmod +x /postAttachCommand.sh

CMD ["zsh"]