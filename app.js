'use strict'
//Instanciar dependencias
    const express = require("express");
    const bodyParser = require("body-parser");
    const request = require("request");
    const access_token = "EAAC0WibSlWsBAJIbguwu1ulkZBpI7zSERljt6CFLucX2pr4OoJIEpWEZCPYmHnRIH6zdN7nRiAm1zQ79esqZBQ1zeKccE8XHA3ZAZAO1lWpGTCCKZC4pcE20tgCAfrYeLmR3i1Cx6iCMem78ojN137c8hPxnKr7RGla1BmCVcfqtRZCFKONGNX6jJuhsg7HrJcZD";
//Creación del servidor
    const app = express();
//Configuración del puerto
    app.set("port", 5000);
//Para la información mandada por la API
    app.use(bodyParser.json());
//Asignar ruta del servidor
    app.get("/", function (req, resp) {
        resp.send("¡Hola mundo!");
    })
//Webhook
    app.get("/webhook", function (req, resp) {
        //Verificación del token
        if (req.query["hub.verify_token"] === "pugpizza_token") {
            resp.send(req.query["hub.challenge"]);
        } else {
            resp.send("Pug Pizza no tienes permisos");
        }
    })
//Recibir evento de webhook
    app.post("/webhook/", function (req, resp) {
        const webhook_event = req.body.entry[0];
        if (webhook_event.messaging) {
            webhook_event.messaging.forEach(event => {
                handleEvent(event.sender.id, event);
                console.log(event);
            });
        }
        resp.sendStatus(200);
    })
//Manejador de mensaejes
    function handleEvent(senderId, event) {
        if (event.message) {
            handleMessage(senderId, event.message);
        } else if (event.postback) {
            handlePostback(senderId, event.postback.payload);
        }
    }

    function handleMessage(senderId, event) {
        if (event.quick_reply) {
            handlePostback(senderId, event.quick_reply.payload);
        }else if (event.text) {
            defaultMessage(senderId);
        } else if (event.attachments) {
            handleAttachments(senderId, event);
        }
    }

    function defaultMessage(senderId) {
        const messageData = {
            recipient: {
                id: senderId
            },
            message: {
                text: "Hola soy un bot de Messenger y te invito a utilizar nuestro menú",
                quick_replies: [
                    {
                        content_type: "text",
                        title: "¿Quieres una pizza?",
                        payload: "PIZZAS_PAYLOAD"
                    },
                    {
                        content_type: "text",
                        title: "Acerca de",
                        payload: "ABOUT_PAYLOAD"
                    }
                ]
            }
        }
        senderActions(senderId);
        setTimeout(() => {
            callSendApi(messageData);
        }, 1500);
    }

    function handlePostback(senderId, payload) {
        switch (payload) {
            case "GET_STARTED_PUGPIZZA":
                console.log(payload);
                break;
            case "ABOUT_PAYLOAD":
                showLocations(senderId);
                contactSupport(senderId);
                break;
            case "PIZZAS_PAYLOAD":
                senderActions(senderId);
                setTimeout(() => {
                    showPizzas(senderId);
                }, 1500);
                console.log(payload);
                break;
            case "PEPERONI_PAYLOAD":
                senderActions(senderId);
                setTimeout(() => {
                    sizePizza(senderId);
                }, 1500);
                break;
            case "PERSONAL_PEPERONI_PAYLOAD":
                senderActions(senderId);
                setTimeout(() => {
                    messageImage(senderId);
                    receipt(senderId);
                }, 1500);
                break;
        }
    }

    function handleAttachments(senderId, event) {
        for (const key in event.attachments) {
            switch (event.attachments[key].type) {
                case "image":
                    console.log("imagen: " + key);
                    break;
                case "video":
                    console.log("video: " + key);
                    break;
                case "audio":
                    console.log("audio: " + key);
                    break;
                case "file":
                    console.log("file: " + key);
                    break;
                case "location":
                    console.log(JSON.stringify(event));
                    break;
            }
        }
    }

    function showPizzas(senderId) {
        const messageData = {
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [
                            {
                                title: "Peperoni",
                                subtitle: "Con todo el sabor del peperoni",
                                image_url: "https://imagenes.milenio.com/CU287W9FW_sUIP1hV9nKcYoMLd0=/958x596/https://www.milenio.com/uploads/media/2019/06/03/no-hay-quien-se-resista.jpg",
                                buttons: [
                                    {
                                        type: "postback",
                                        title: "Elegir peperoni",
                                        payload: "PEPERONI_PAYLOAD"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        }
        callSendApi(messageData);
    }

    function sizePizza(senderId) {
        const messageData = {
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [
                            {
                                title: "Peperoni personal",
                                subtitle: "20cm",
                                image_url: "https://imagenes.milenio.com/CU287W9FW_sUIP1hV9nKcYoMLd0=/958x596/https://www.milenio.com/uploads/media/2019/06/03/no-hay-quien-se-resista.jpg",
                                buttons: [
                                    {
                                        type: "postback",
                                        title: "Elegir personal",
                                        payload: "PERSONAL_PEPERONI_PAYLOAD"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        }
        callSendApi(messageData);
    }

    function messageImage(senderId) {
        const messageData = {
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "image",
                    payload: {
                        url: "https://imagenes.milenio.com/CU287W9FW_sUIP1hV9nKcYoMLd0=/958x596/https://www.milenio.com/uploads/media/2019/06/03/no-hay-quien-se-resista.jpg"
                    }
                }
            }
        }
        callSendApi(messageData);
    }

    function contactSupport(senderId) {
        const messageData = {
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: "Hola este es el canal de soporte ¿Quieres llamarnos?",
                        buttons: [
                            {
                                type: "phone_number",
                                title: "Llamar a un asesor",
                                payload: "+522223129422"
                            }
                        ]
                    }
                }
            }
        }
        callSendApi(messageData);
    }

    function showLocations(senderId) {
        const messageData = {
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [
                            {
                                title: "Sucursal 1",
                                subtitle: "Dirección 1",
                                image_url: "https://imagenes.milenio.com/CU287W9FW_sUIP1hV9nKcYoMLd0=/958x596/https://www.milenio.com/uploads/media/2019/06/03/no-hay-quien-se-resista.jpg",
                                buttons: [
                                    {
                                        title: "Ver en el mapa",
                                        type: "web_url",
                                        url: "https://goo.gl/maps/B3A9MfqvRw4MYRVD9",
                                        webview_height_ratio: "full"
                                    }
                                ]
                            },
                            {
                                title: "Sucursal 2",
                                subtitle: "Dirección 2",
                                image_url: "https://imagenes.milenio.com/CU287W9FW_sUIP1hV9nKcYoMLd0=/958x596/https://www.milenio.com/uploads/media/2019/06/03/no-hay-quien-se-resista.jpg",
                                buttons: [
                                    {
                                        title: "Ver en el mapa",
                                        type: "web_url",
                                        url: "https://goo.gl/maps/k6B2B5QcgfoFkSAg9",
                                        webview_height_ratio: "tall"
                                    }
                                ]
                            },
                            {
                                title: "Sucursal 3",
                                subtitle: "Dirección 3",
                                image_url: "https://imagenes.milenio.com/CU287W9FW_sUIP1hV9nKcYoMLd0=/958x596/https://www.milenio.com/uploads/media/2019/06/03/no-hay-quien-se-resista.jpg",
                                buttons: [
                                    {
                                        title: "Ver en el mapa",
                                        type: "web_url",
                                        url: "https://goo.gl/maps/k6B2B5QcgfoFkSAg9",
                                        webview_height_ratio: "compact"
                                    }
                                ]
                            }
                        ]
                    }
                }
            }
        }
        callSendApi(messageData);
    }

    function receipt(senderId) {
        const messageData = {
            recipient: {
                id: senderId
            },
            message: {
                attachment: {
                    type:"template",
                    payload: {
                        template_type: "receipt",
                        recipient_name: "Stephane Crozatier",
                        order_number: "12345678902",
                        currency: "USD",
                        payment_method: "Visa 2345",
                        order_url: "http://petersapparel.parseapp.com/order?order_id=123456",
                        timestamp: "1428444852",
                        address: {
                            street_1: "1 Hacker Way",
                            street_2: "",
                            city: "Menlo Park",
                            postal_code: "94025",
                            state: "CA",
                            country: "US"
                        },
                        summary:{
                            subtotal: 75.00,
                            shipping_cost: 4.95,
                            total_tax: 6.19,
                            total_cost: 56.14
                        },
                        adjustments:[
                            {
                                name: "New Customer Discount",
                                amount:20
                            },
                            {
                                name: "$10 Off Coupon",
                                amount: 10
                            }
                        ],
                        elements:[
                            {
                                title: "Classic White T-Shirt",
                                subtitle: "100% Soft and Luxurious Cotton",
                                quantity: 2,
                                price: 50,
                                currency: "USD",
                                image_url: "http://petersapparel.parseapp.com/img/whiteshirt.png"
                            },
                            {
                                title: "Classic Gray T-Shirt",
                                subtitle: "100% Soft and Luxurious Cotton",
                                quantity: 1,
                                price: 25,
                                currency: "USD",
                                image_url: "http://petersapparel.parseapp.com/img/grayshirt.png"
                            }
                        ]
                    }
                }
            }
        }
        callSendApi(messageData);
    }
    //Obseleta
    function getLocation(senderId) {
        const messageData = {
            recipient: {
                id: senderId
            },
            message: {
                text: "Ahora ¿Puedes proporcionarnos tu ubicación?",
                quick_replies: [
                    {
                        content_type: "location"
                    }
                ]
            }
        }
        callSendApi(messageData);
    }
//Enviar respuesta
    function senderActions(senderId) {
        const messageData = {
            recipient: {
                id: senderId
            },
            sender_action: "typing_on"
        }
        callSendApi(messageData);
    }

    function callSendApi(resp) {
        request({
            uri: "https://graph.facebook.com/v6.0/me/messages/",
            qs: {
                access_token: access_token
            },
            method: "POST",
            json: resp
        },
        function (error) {
            if (error) {
                console.log("Ha ocurrido un error");
            } else {
                console.log("Mensaje enviado");
            }
        })
    }
//Comprobar funcionamiento de la aplicación
app.listen(app.get("port"), function () {
    console.log("Nuestro servidor esta funcionando en el puerto %d", app.get("port"));
})