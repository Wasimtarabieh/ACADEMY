// تفعيل تشغيل الفيديو عند النقر عليه
document.querySelectorAll('.carousel-slide video').forEach(video => {
    video.addEventListener('click', function() {
        if (this.paused) {
            this.play();
        } else {
            this.pause();
        }
    });
});

// إعداد PayPal لدورة 1
paypal.Buttons({
    style: {
        color: 'blue',
        shape: 'pill',
        label: 'pay',
        height: 40
    },
    createOrder: function(data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: '15.00' // السعر بالدولار لدورة 1
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            alert('تم شراء الدورة 1 بنجاح! شكرًا لك، ' + details.payer.name.given_name);
        });
    },
    onError: function (err) {
        alert('حدث خطأ أثناء عملية الدفع لدورة 1. يرجى المحاولة مرة أخرى.');
    }
}).render('#paypal-button-container1');

// إعداد PayPal لدورة 2
paypal.Buttons({
    style: {
        color: 'blue',
        shape: 'pill',
        label: 'pay',
        height: 40
    },
    createOrder: function(data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: '20.00' // السعر بالدولار لدورة 2
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            alert('تم شراء الدورة 2 بنجاح! شكرًا لك، ' + details.payer.name.given_name);
        });
    },
    onError: function (err) {
        alert('حدث خطأ أثناء عملية الدفع لدورة 2. يرجى المحاولة مرة أخرى.');
    }
}).render('#paypal-button-container2');

// إعداد PayPal لدورة 3
paypal.Buttons({
    style: {
        color: 'blue',
        shape: 'pill',
        label: 'pay',
        height: 40
    },
    createOrder: function(data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: '25.00' // السعر بالدولار لدورة 3
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            alert('تم شراء الدورة 3 بنجاح! شكرًا لك، ' + details.payer.name.given_name);
        });
    },
    onError: function (err) {
        alert('حدث خطأ أثناء عملية الدفع لدورة 3. يرجى المحاولة مرة أخرى.');
    }
}).render('#paypal-button-container3');
