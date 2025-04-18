const MetodoPago = require('../models/metodos');
const mongoose = require('mongoose'); // Asegúrate de importar mongoose para validar ObjectId

// Obtener todos los métodos de pago disponibles (estado = 1)
exports.obtenerMetodosPago = async (req, res) => {
    try {
        const metodosPago = await MetodoPago.find({ estado: 1 }).select('_id metodo');

        res.status(200).json({
            Metodos: metodosPago
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            mensaje: `Ocurrió un error: ${error.message}`
        });
    }
};

// Obtener un método de pago por su ID
exports.obtenerMetodoPagoPorId = async (req, res) => {
    try {
        const { _id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                status: 400,
                mensaje: "ID inválido. Asegúrate de que el formato sea correcto."
            });
        }

        const metodoPago = await MetodoPago.findById(_id).select('_id metodo');

        if (!metodoPago) {
            return res.status(404).json({
                status: 404,
                mensaje: "Método de pago no encontrado."
            });
        }

        res.status(200).json({
            Metodo: {
                IdMetodo: metodoPago._id,
                Metodo: metodoPago.metodo
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            mensaje: `Ocurrió un error: ${error.message}`
        });
    }
};

// Crear un nuevo método de pago
exports.create = async (req, res) => {
    try {
        const metodoPago = new MetodoPago(req.body);

        if (!metodoPago.metodo) {
            return res.status(400).send('El método de pago es obligatorio');
        }

        const nuevoMetodo = new MetodoPago({
            metodo: metodoPago.metodo,
            estado: 1
        });

        await nuevoMetodo.save();

        res.status(200).json({
            status: 200,
            mensaje: "Método creado exitosamente"
        });
    } catch (error) {
        console.log(error);
        res.status(400).send('Hubo un error');
    }
};

exports.eliminarMetodo = async (req, res) => {
    try {

        const { _id } = req.params;

        const metodoEliminado = await MetodoPago.findByIdAndUpdate(
            _id,
            { estado: 0, updatedAt: new Date() },
            { new: true }
        );

        if (!metodoEliminado) {
            return res.status(404).json({
                status: 404,
                mensaje: "Método de pago no encontrado."
            });
        }

        res.status(200).json({
            status: 200,
            mensaje: "Metodo eliminado exitosamente"
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            mensaje: `Ocurrió un error: ${error.message}`
        });
    }
};
