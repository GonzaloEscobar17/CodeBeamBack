const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const dotenv = require("dotenv");
const nodemailer = require("nodemailer");

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configurar middlewares
app.use(cors());
app.use(express.json());

// Conexión a la base de datos MySQL
const connection = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "kovix",
  password: process.env.DB_PASSWORD || "Fngg1043",
  database: process.env.DB_NAME || "codebeam",
});

// Verificar la conexión
connection.connect((err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err);
    return;
  }
  console.log("Conexión a la base de datos MySQL establecida");
});

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
  service: "hotmail",
  auth: {
    user: "codebeam2024@outlook.com", // Correo que envía el email
    pass: "jahsvyukmhatyfkc", // Clave de aplicación de Outlook o la contraseña
  },
});

// Ruta para recibir los datos del formulario
app.post("/api/submit-form", (req, res) => {
  const { name, email, description, termsAccepted, privacyAccepted } = req.body;

  // Validar que todos los campos están presentes
  if (
    !name ||
    !email ||
    !description ||
    termsAccepted === undefined ||
    privacyAccepted === undefined
  ) {
    return res
      .status(400)
      .json({ message: "Todos los campos son obligatorios." });
  }

  // Insertar los datos en la base de datos
  const query = `INSERT INTO formulario (name, email, description, terms_accepted, privacy_accepted) VALUES (?, ?, ?, ?, ?)`;
  connection.query(
    query,
    [name, email, description, termsAccepted, privacyAccepted],
    (err, results) => {
      if (err) {
        console.error("Error al insertar los datos en la base de datos:", err);
        return res
          .status(500)
          .json({ message: "Error al enviar el formulario." });
      }

      // enviar el correo
      const mailOptions = {
        from: "codebeam2024@outlook.com", // El mismo correo que autenticas
        to: "codebeam2024@outlook.com", // Correo al que quieres notificar
        subject: "Nueva solicitud pendiente",
        text: `Se ha recibido una nueva solicitud en la base de datos. Los detalles del solicitante son: 
               Nombre: ${name}, 
               Email: ${email}, 
               Descripción: ${description}.`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error al enviar el correo:", error);
        } else {
          console.log("Correo enviado: " + info.response);
        }
      });

      // Responder al cliente
      res.status(200).json({
        message: "Formulario enviado con éxito y notificación enviada.",
      });
    }
  );
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor ejecutándose en el puerto ${port}`);
});
