* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

body {
    background-color: #f3f4f6;
    color: #333;
}

.container {
    width: 90%;
    max-width: 1200px;
    margin: auto;
    padding: 20px;
}

.hero {
    background: linear-gradient(135deg, #0078ff, #00d1ff);
    color: #fff;
    padding: 100px 0;
    text-align: center;
    position: relative;
    overflow: hidden;
}

.hero h1 {
    font-size: 2.8em;
    font-weight: bold;
    margin-bottom: 10px;
    line-height: 1.2;
}

.hero h1 span {
    color: #ffe600;
    text-shadow: 1px 1px 10px rgba(0,0,0,0.4);
}

.hero p {
    font-size: 1.2em;
    margin-bottom: 20px;
}

.cta-button {
    background: linear-gradient(45deg, #00ff87, #00d1ff);
    color: #fff;
    padding: 12px 25px;
    font-size: 1.2em;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.cta-button:hover {
    background: linear-gradient(45deg, #00d1ff, #00ff87);
    transform: scale(1.05);
}

.features {
    padding: 50px 0;
    text-align: center;
    background: #f9f9fb;
}

.features h2 {
    font-size: 2em;
    color: #333;
    margin-bottom: 30px;
}

.feature {
    margin: 20px;
    display: inline-block;
    width: 30%;
    vertical-align: top;
}

.feature h3 {
    font-size: 1.5em;
    color: #0078ff;
}

.feature p {
    color: #666;
}

.testimonials {
    padding: 60px 0;
    background: #e5f3ff;
    text-align: center;
}

.testimonials h2 {
    font-size: 2em;
    margin-bottom: 30px;
    color: #333;
}

.testimonial {
    width: 45%;
    margin: 15px auto;
    padding: 20px;
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.signup {
    padding: 60px 0;
    background: linear-gradient(135deg, #00d1ff, #0078ff);
    color: #fff;
    text-align: center;
}

.signup h2 {
    font-size: 2.2em;
    margin-bottom: 20px;
}

.signup input {
    padding: 10px;
    margin: 10px;
    width: 45%;
    max-width: 300px;
    border: none;
    border-radius: 25px;
}

.signup button {
    padding: 10px 20px;
    background: #ffe600;
    border: none;
    color: #333;
    font-size: 1em;
    border-radius: 25px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.signup button:hover {
    background: #fff;
    color: #0078ff;
}

footer {
    padding: 20px;
    text-align: center;
    background: #333;
    color: #fff;
}

footer .social-links a {
    color: #00d1ff;
    margin: 0 10px;
    text-decoration: none;
    font-size: 1.1em;
    transition: all 0.3s ease;
}

footer .social-links a:hover {
    color: #00ff87;
}
