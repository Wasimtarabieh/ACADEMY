// كود PayPal لتفعيل عملية الدفع
paypal.Buttons({
    style: {
        color: 'blue',
        shape: 'pill',
        label: 'pay',
        height: 45
    },
    createOrder: function(data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    value: '10.00' // قيمة الدفع بالدولار
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(function(details) {
            alert('تمت العملية بنجاح! شكرًا لك، ' + details.payer.name.given_name + '. سنتواصل معك قريبًا.');
        });
    },
    onError: function (err) {
        alert('حدث خطأ أثناء عملية الدفع. يرجى المحاولة مرة أخرى.');
    }
}).render('#paypal-button-container');
