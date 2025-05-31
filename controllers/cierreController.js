const Transaccion = require('../models/transaccion');
const   CierreCaja = require('../models/cierre');
const   mongoose = require('mongoose'); 
const MetodoPago = require('../models/metodos');
const Retiros = require('../models/retiros');

exports.obtenerCierres = async (req, res) => {
    try {
        const { fechaInicio, fechaFinal } = req.body;

        const filtroFecha = {};
        if (fechaInicio && fechaFinal) {
            filtroFecha.fecha = {
                $gte: new Date(fechaInicio),
                $lte: new Date(fechaFinal)
            };
        }

        const cierres = await CierreCaja.find(filtroFecha);

        const resultado = cierres.map(cierre => ({
            Id: cierre._id,
            IdCaja: cierre.idCaja,
            Servicio: cierre.idServicio,
            Fecha: cierre.fecha,
            CantidadInicial: cierre.cantidadIncial || 0,
            CantidadFinal: cierre.cantidadFinal,
            TotalDia: cierre.totalDia || 0,
            Retiro: cierre.retiro,
            Empleado: cierre.usuario.length > 0 ? {
                IdEmpleado: cierre.usuario[0].idUsuario,
                NombreCompleto: cierre.usuario[0].nombreUsuario
            } : {},
            
        }));

        res.status(200).json({ cierre: resultado });
    } catch (error) {
        console.error('Error al obtener cierres:', error);
        res.status(500).json({
            mensaje: 'Error al obtener los cierres de caja',
            error: error.message
        });
    }
};

exports.create = async (req, res) => {
    try {
        console.log(req.body);
        const cantidad_retirar = req.body.Retiro;
        const idCaja = req.body.IdCaja;
        const idServicio = req.body.Servicio;
        const cantidadFinal = req.body.CantidadFinal;
        const empleado = req.body.Empleado;
        const fecha = new Date();
        const soloFecha = fecha.toISOString().split('T')[0];
        let totalDia = 0;
        const ultimoCierre = await CierreCaja.findOne({
            idCaja: idCaja,         
            idServicio: idServicio   
        }).sort({ createdAt: -1 });
        let cantidadInicial = 0;
        let fechaInicioFiltro = new Date('1900-01-01');
        if(ultimoCierre){
            cantidadInicial = ultimoCierre.cantidadFinal;
            fechaInicioFiltro = ultimoCierre.createdAt;
            console.log(cantidadInicial);
        }
        const fechaFinFiltro = new Date();
        const Transacciones = await Transaccion.find({
            servicioTransaccion: idServicio,
            idCaja: idCaja,
            createdAt: { $gt: fechaInicioFiltro, $lte: fechaFinFiltro }
        });
        console.log(Transacciones);
        for (const transaccion of Transacciones){
            console.log(transaccion);
            for(const metodoPago of transaccion.metodosPago){
                console.log(metodoPago);
                if(metodoPago.idMetodo == 1){
                    totalDia += metodoPago.monto;
                }
            }
        }
        if((cantidadInicial + totalDia) < cantidad_retirar)
        {
            return res.status(500).json({mensaje: "La cantidad a retirar es mayor a la cantidad que existe" });
        }
        if((cantidadInicial + totalDia)!= cantidadFinal)
        {
            return res.status(500).json({mensaje: "No se puede hacer el cierre debido a que no cuadra"})
        }
        let cantidadFinal1 = cantidadInicial + totalDia - cantidad_retirar;
        console.log(totalDia);
        const ObjetoCierre = new CierreCaja ({
            idCaja: idCaja,
            idServicio: idServicio,
            fecha: soloFecha,
            cantidadInicial: cantidadInicial,
            cantidadFinal: cantidadFinal1,
            totalDia: totalDia,
            usuario: {
                idUsuario: empleado.IdEmpleado,
                nombreUsuario: empleado.NombreCompleto
            },
            retiro: cantidad_retirar
        });
        const cierreGuardado = await ObjetoCierre.save();
        console.log(cierreGuardado);
        const objetoCierreGuardado = {
            IdCaja: cierreGuardado.idCaja,
            IdServicio: cierreGuardado.idServicio,
            Fecha: cierreGuardado.fecha,
            CantidadFinal: cierreGuardado.cantidadFinal,
            TotalDia: cierreGuardado.totalDia,
            Usuario: [
                {
                    idUsuario: cierreGuardado.usuario.idUsuario,
                    nombreUsuario: cierreGuardado.usuario.nombreUsuario
                }
            ],
            _id: cierreGuardado._id,
            CreatedAt: cierreGuardado.createdAt,
            UpdatedAt:cierreGuardado.updatedAt 
        }
        res.status(201).json(objetoCierreGuardado);
    } catch (error) {
        console.error('Error al crear cierre de caja:', error);
        res.status(500).json({ mensaje: 'Error al crear el cierre de caja'});
    }
};

// export const createRetiro = async (req, res) => {
//     const idCaja = req.body.IdCaja;
//     const monto = req.body.Monto;
//     const idServicio = req.body.Servicio;


//     try{

//     }catch(error){

//     }
// }