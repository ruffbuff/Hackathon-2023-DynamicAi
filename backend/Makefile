NAME ?= dynnft
VERSION ?= 3
TAG ?= ${VERSION}
LOGIN = ambientiumim
DOCKER_REPO=${LOGIN}/${NAME}

restart: stop start

build:  ## build docker image
	docker build -t ${NAME}:${TAG} .
	docker rmi -f $(shell docker images -qf 'dangling=true') >/dev/null 2>&1 || true

login:  ## login to docker registry
	docker login 

logout: ## docker logout
	docker logout

tag:    ## add before push
	docker tag ${NAME}:${TAG} ${LOGIN}/${NAME}:${TAG}

pull:   ## get image
	docker pull ${DOCKER_REPO}/${NAME}:${TAG}

push:   ## push image to docker 
	docker push ${LOGIN}/${NAME}:${TAG}


run:  ## start docker
	docker run -it -d \
	-v ${PWD}:/usr/src/app \
	--restart=always \
	--name dynnft \
	${LOGIN}/${NAME}:${TAG}

stop:   ## stop and remove container
	docker rm -fv ${NAME} >/dev/null 2>&1|| true

log:    ## realtime logging
	docker logs --tail=300 -f ${NAME}

start:    run log
