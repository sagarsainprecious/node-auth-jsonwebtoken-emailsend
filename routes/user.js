const router = require("express").Router();
const { User, validate } = require("../model/user");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

var Mailgen = require('mailgen');



var mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'You are Onboarded',
        link: 'hhttps://www.google.com/',
        // Optional product logo
        logo: 'https://w7.pngwing.com/pngs/937/386/png-transparent-registered-trademark-symbol-copyright-copyright-game-text-trademark-thumbnail.png'
    }
});




router.post("/", async (req, res) => {
    try {
        //validation of user data

        const { error } = validate(req.body);


        if (error)
            return res.status(400).send({ message: error.details[0].message });

        // validation if user is already exist
        const user = await User.findOne({ email: req.body.email });
        if (user)
            return res
                .status(409)
                .send({ message: "User with given email already Exist!" });

        //hashing a storing password 
        const salt = await bcrypt.genSalt(Number(process.env.SALT));
        const hashPassword = await bcrypt.hash(req.body.password, salt);

        await new User({ ...req.body, password: hashPassword }).save();



        //sending mail on successfully registration of user
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: 'kelli.bailey@ethereal.email',
                pass: 'HGBk9YSqaXKsKPy6t2'
            }
        });


        //setting mail body

        var email = {
            body: {
                name: req.body.firstName,
                intro: `Welcome to Mailgen! We\'re very excited to have you on board.`,
                action: {
                    instructions: 'To get started with Google, please click here:',
                    button: {
                        color: '#22BC66', // Optional action button color
                        text: 'Confirm your account',
                        link: 'https://google.com'
                    }
                },
                outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
            }
        };

        var emailBody = mailGenerator.generate(email);

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: '"Testing mail" <kelli.bailey@ethereal.email>', // sender address
            to: "river-canal-63@inboxkitten.com", // list of receivers
            subject: "Hello from node backend", // Subject line
            text: "Hello from node", // plain text body
            html: emailBody, // html body
        });

        console.log(info.messageId)

        // sending response to user
        res.status(201).send({ message: "User created successfully" });
    } catch (error) {
        res.status(500).send({ message: "Internal Server Error" });
    }
});


module.exports = router;