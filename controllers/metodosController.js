const MetodoPago = require('../models/metodos');
const mongoose = require('mongoose'); 

exports.obtenerMetodosPago = async (req, res) => {
    try {
        const metodosPago = await MetodoPago.find({ estado: 1 }).select('_id metodo noMetodo');

        const metodosTransformados = metodosPago.map(metodo => ({
            idMetodo: metodo._id,
            Metodo: metodo.metodo,
            NoMetodo: metodo.noMetodo
        }));

        res.status(200).json(metodosTransformados);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Ocurrió un error'
        });
    }
};

exports.obtenerTransaccionesMetodo = async (req, res) => {
    const metodo = req.params.noMetodo
    try{
        const metodoPago = await MetodoPago.findOne({noMetodo: metodo})
        if(!metodoPago) {
            return res.status(500).json({mensaje: "El metodo de pago no es valido"})
        }
        let montoTotal = 0
        const transaccionesMetodo = metodoPago.transacciones
        for(const element of transaccionesMetodo){
            montoTotal += parseFloat(element.monto)
        }
        console.log("Monto total del metodo: ", montoTotal)
        res.status(200).json({
            MontoTotal: montoTotal,
            Transacciones:transaccionesMetodo
        })
    }
    catch(error){
        res.status(500).json({ mensaje: 'Error al listar las transacciones', error: error.message });
    }


}
exports.obtenerMetodoPagoPorId = async (req, res) => {
    try {
        const { _id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            return res.status(400).json({
                mensaje: "ID inválido. Asegúrate de que el formato sea correcto."
            });
        }

        const metodoPago = await MetodoPago.findById(_id).select('_id metodo noMetodo');

        if (!metodoPago) {
            return res.status(404).json({
                mensaje: "Método de pago no encontrado."
            });
        }

        res.status(200).json({

                idMetodo: metodoPago._id,
                Metodo: metodoPago.metodo,
                NoMetodo: metodoPago.noMetodo
        });
    } catch (error) {
        res.status(500).json({
            status: 500,
            mensaje: `Ocurrió un error: ${error.message}`
        });
    }
};

exports.create = async (req, res) => {
    try {
        const metodoPago = req.body.Metodo;

        if (!metodoPago) {
            return res.status(400).json({mensaje:'El método de pago es obligatorio'});
        }

        const nuevoMetodo = new MetodoPago({
            metodo: metodoPago,
            estado: 1
        });

        await nuevoMetodo.save();

        res.status(200).json({
            mensaje: "Método creado exitosamente"
        });
    } catch (error) {
        console.log(error);
        res.status(400).json({mensaje:'Hubo un error'});
    }
};

exports.eliminarMetodo = async (req, res) => {
    try {

        const {id_metodo} = req.params;

        const metodoEliminado = await MetodoPago.findByIdAndUpdate(
            id_metodo,
            { estado: 0, updatedAt: new Date() },
            { new: true }
        );

        if (!metodoEliminado) {
            return res.status(500).json({
                mensaje: "Método de pago no encontrado."
            });
        }

        res.status(200).json({
            mensaje: "Metodo eliminado exitosamente"
        });
    } catch (error) {
        res.status(500).json({
            mensaje: `Ocurrió un error`
        });
    }
};

exports.resumenPorMetodo  = async(req, res)  =>{
    const { fechaInicio, fechaFinal } = req.body;
    try {
      const metodos = await MetodoPago.find({ estado: 1 });
  
      const resumen = metodos.map(metodo => {
        let transaccionesFiltradas = metodo.transacciones;
  
        if (fechaInicio || fechaFinal) {
          const fi = fechaInicio ? new Date(fechaInicio) : new Date('1900-01-01');
          const ff = fechaFinal ? new Date(fechaFinal) : new Date();
          transaccionesFiltradas = transaccionesFiltradas.filter(tx => {
            const fechaTx = new Date(tx.createdAt || tx.fecha || metodo.updatedAt); 
            return fechaTx >= fi && fechaTx <= ff;
          });
        }
  
        const totalMonto = transaccionesFiltradas.reduce((sum, tx) => sum + tx.monto, 0);
  
        return {
          metodo: metodo.metodo,
          cantidadTransacciones: transaccionesFiltradas.length,
          totalRecaudado: totalMonto.toFixed(2)
        };
      });
  
      return res.status(200).json({ resumen });
    } catch (error) {
      console.error("Error al generar el resumen:", error);
      return res.status(500).json({ mensaje: "Ocurrió un error al generar el resumen" });
    }
  }