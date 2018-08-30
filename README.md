# Full IoT product: smart light on Mongoose OS

This repository contains the implementation of the full, functional commercial IoT product under a commercial-friendly Apache 2.0 license.
It utilises the power of [Mongoose OS](https://mongoose-os.com) and can be used as a reference for creating similar smart products.

This project implements a smart light. For the hardware, we use a development board with an LED, which serves as a light. The devboard can be
"shipped" to a customer. A customer provisions it using a mobile app.
You, as a vendor, have full control
over all "shipped" products, including device
dashboard with remote firmware updates, remote management and usage statistics.

This short video demonstrates the use case:

TBD

## Step-by-step usage guide

1. Get a hardware device. We simulate a real smart lite with one of the
   supported development boards - choose one from https://mongoose-os.com/docs/quickstart/devboards.md. The built-in LED
   on the devboard will act as a light. Alternatively, you can put together
   your own hardware setup, just make sure to alter `firmware/mos.yml` to set
   the GPIO pin number for the LED.
2. Follow https://mongoose-os.com/software.html to
   install `mos`, a Mongoose OS command-line tool.
3. Clone this repository:
   ```
   git clone https://github.com/cesanta/mongoose-os-smart-light
   ```
5. Install [Docker Compose](https://docs.docker.com/compose/) and
   start the backend on your workstation (or any other machine):
   ```
   cd backend
   docker-compose build
   docker-compose up
   ```
   NOTE: on MacOS, make sure to use Docker for Mac (not Docker toolbox),
   see https://docs.docker.com/docker-for-mac/docker-toolbox/. That is
   required cause Docker toolbox installation on Mac requires extra steps
   to forward opened ports.
6. Connect your device to your workstation via a USB cable. Build and
   flash the device:
   ```
   cd mongoose-os-smart-light/firmware
   mos build --platform YOUR_PLATFORM  # esp32, cc3220, stm32, esp8266
   mos flash
   ```
8. Register a new device on a management dashboard, obtain access token:
   ```
   $ curl -d '{"name": "device1"}' -H 'Content-Type: application/json' -u admin:admin http://192.168.1.21:8009/api/v2/devices
   {
     ...
     "id": "a652730904b5fa792e67fa8c",
     "token": "d7e60b25f49bbeb14bca3fc4",
     ...
   }
   ```
   If you login to the dash at http://YOUR_WORKSTATION_IP:8009 with
   username/password `admin/admin`, you should be able to see your new device.
9. Configure your device with a dashboard:
   ```
   mos config-set --no-reboot device.password=GENERATED_DEVICE_ID
   mos config-set --no-reboot dash.server=ws://YOUR_WORKSTATION_IP:8009/api/v2/rpc
   mos config-set --no-reboot dash.token=ACCESS_TOKEN
   mos config-set --no-reboot conf_acl=wifi.*,dash.enable
   mos call FS.Rename '{"src": "conf9.json", "dst": "conf5.json"}'
   ```
   The `mos config-set` command generates `conf9.json` file on a device,
   and `mos call FS.Rename` renames it to `conf5.json`, in order to make this
   configuration immune to factory reset. 


## General Architecture

The backend is installed on your workstation (so called on-premises
installation). It is completely self-contained, not requiring any external
service to run, and run as a collection of Docker images (docker-compose).
Thus, such backend could be run on any server, e.g. as a AWS EC2 instance,
Google Cloud instance, etc.


Device management backend is mDash (the same that runs on
https://dash.mongoose-os.com), the frontend is a PWA (progressive web app).
Both are behind Nginx, which terminates SSL from devices and mobile apps.

<img src="media/a1.png" class="mw-100" />

## Backend

The mDash comes pre-configured with a single administrator user `admin`
(password `admin`). That was done with the following command:

```
docker-compose run dash /dash --config-file /data/dash_config.json --register-user admin admin
```

The resulting `backend/data/dash_db.json` mDash database was committed to
the repo. The API key, automatically created for the admin user, is used
by the API Server for all API Server <-> mDash communication, and specified
as the `--token` flag in the `backend/docker-compose.yml` file. Thus,
the API Server talks to the mDash with the administrative privileges.

## Device provisioning process

## Mobile app

The mobile app is a Progressive Web App (PWA). When first downloaded and run
on a mobile phone or desktop browser, it generates a unique ID, and sets
a cookie `app_id`, which is used to authenticate the mobile phone with the
API server. The API server creates a user on the mDash for that `app_id`.

## Mongoose OS - based firmware

## Device dashboard

## Usage statistics and analytics
