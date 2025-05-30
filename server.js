// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('morgan');
const http = require('http');
const mongoose = require('mongoose');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const merge = require('deepmerge');

const app = express();
const port = parseInt(process.env.PORT, 10) || 3001;
app.use(express.json()); 
const transacciones = YAML.load('./docs/transacciones.yaml');
const clientes = YAML.load('./docs/clientes.yaml');
const facturas = YAML.load('./docs/facturas.yaml');
const fidelidad = YAML.load('./docs/fidelidad.yaml');
const bancos = YAML.load('./docs/bancos.yaml')
const cierres = YAML.load('./docs/cierres.yaml')
const devoluciones = YAML.load('./docs/devoluciones.yaml')
const metodos = YAML.load('./docs/metodos.yaml')
const pagos = YAML.load('./docs/pagos.yaml')

const swaggerDocument = merge.all([
  transacciones,
  clientes,
  facturas,
  fidelidad,
  bancos,
  cierres,
  devoluciones,
  metodos,
  pagos
]);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const connectDB = async () => {
  try {
    //mongodb://localhost:27017/pagos conexion local
      await mongoose.connect('mongodb+srv://sebastianrocop7:silotengoquepediryanoquiero@cluster0.4nad6qy.mongodb.net/pagos', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
      });
      console.log('Conectado a MongoDB');
  } catch (error) {
      console.error('Error al conectar a MongoDB', error);
      process.exit(1);
  }
};



connectDB()


// Middlewares
app.use(logger('dev'));
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: false }));


app.use(express.static('./public'));


require("./routes/index")(app);


app.get('*', (req, res) => res.status(200).send({
  message: 'Index.',
}));


const server = http.createServer(app);

// Iniciar el servidor
server.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});

module.exports = app;
