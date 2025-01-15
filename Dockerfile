# Initiated by Tran IT <tran@inginim.com>
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
COPY firebase.config.js ./
COPY tsconfig*.json ./

RUN apk add --no-cache python3 py3-pip
RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

ENV PATH /usr/src/app/node_modules/.bin:$PATH
WORKDIR /usr/src/app/src

# Bundle app source
COPY . .

# Addition commands
RUN npx prisma generate
RUN yarn build

EXPOSE 8001
CMD [ "npm", "run", "start:dev" ]

# Build Image
# docker build . -t inginim/rsaf-transportapp-phase2

# Run Image
# docker run -p 8002:8002 -v `pwd`/:/usr/src/app/src inginim/rsaf-transportapp-phase2
