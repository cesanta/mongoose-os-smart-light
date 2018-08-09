# Full IoT product example

This repository contains the implementation of the full, functional commercial IoT product.
It utilises the power of [Mongoose OS](https://mongoose-os.com) and can be used as a reference for creating other similar products.

This project implements a smart light. For the hardware, we use a development board with an LED, which serves as a light. The devboard can be
"shipped" to a customer, which provisions it using
a mobile app. You, as a vendor, have full control
over all "shipped" products, including device
dashboard with remote firmware updates, remote management and usage statistics.

This short video demonstrates the use case:

TBD

## Step-by-step usage guide

## General Architecture

The backend is installed on your workstation (so called on-premises
installation). It is completely self-contained, not requiring any external
service to run, and run as a collection of Docker images (docker-compose).
Device management backend is mDash (the same that runs on
https://dash.mongoose-os.com), the frontend is a PWA (progressive web app).
Both are behind Nginx, which terminates SSL from devices and mobile apps.

```
                                        ┌──────────────────────┬──────────┐
                                        │  Database (metrics)  │          │
     .                                  ├──────────────────────┤ FRONTEND │
LED ( )                                 │   BACKEND (mDash)    │   (PWA)  │
 ┌───'───────┐ Secure WebSocket (WSS)   ├──────────────────────┴──────────┤
 │  DEVICE   │──────────────────────────│              NGINX              │
 └───────────┘                          └─────────────────────────────────┘
                          ┌┐   REST    ╱              ┌───────────────────┐
                      ┌───┴┴┐ (HTTPS) ╱               │ ┌───────────────┐ │
          Progressive │ ┌─┐ │        ╱                │ │     Your      │ │
            Web App   │ │ │ │ ──────/                 │ │  workstation  │ │
             (PWA)    │ │ │ │                         │ └───────────────┘ │
                      │ └─┘ │                         └────────┬─┬────────┘
                      └─────┘                              ┌───┴─┴───┐     
                                                           └─────────┘       
```

## Backend

## Frontend

## Provisioning process

## Mobile app

## Mongoose OS - based firmware

## Device dashboard

## Usage statistics and analytics
