const mongoose = require('mongoose');
const moment = require('moment-timezone');
const entradaSchema = new mongoose.Schema({
    id_entrada: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
        default: () => `ENT-${Date.now()}`  // Genera un ID único basado en timestamp
    },
    id_producto: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'productos',  // Referencia al modelo de productos
        required: true,
        index: true
    },
    cantidad: {
        type: Number,
        required: true,
        min: [1, 'La cantidad debe ser mayor a 0']
    },
    tipo_entrada: {
        type: String,
        required: true,
        enum: [
            'Compra',
            'Devolución',
            'Transferencia',
            'Ajuste de Inventario',
            'Producción',
            'Otro'
        ],
        index: true
    },
    precio_unitario: {
        type: Number,
        required: true,
        min: [0, 'El precio unitario no puede ser negativo']
    },
    precio_venta: {
        type: Number,
        required: true,
        min: [0, 'El precio de venta no puede ser negativo']
    },
    proveedor: {
        type: String,
        trim: true,
        default: 'Genérico'
    },
    observaciones: {
        type: String,
        trim: true
    },
    fecha_registro: {
        type: Date,
        default: Date.now,
        index: true
    },
    usuario_registro: {
        type: String,
        default: 'Admin',
        required: true
    },
    precio_dolar: {  // Nuevo campo para el precio del dólar
        type: Number,
        required: true,
        min: [0, 'El precio del dólar no puede ser negativo']
    },
    status: {  // Nuevo campo para el estado de la entrada
        type: String,
        default: 'PENDIENTE',
        enum: ['PENDIENTE', 'COMPLETADA', 'CANCELADA']  // Opciones para el estado
    }
},{
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

entradaSchema.pre('save', function(next) {
    this.createdAt = moment.tz(this.createdAt || new Date(), "America/Caracas").toDate();
    this.updatedAt = moment.tz(new Date(), "America/Caracas").toDate();
    next();
});

entradaSchema.methods.getFormattedDates = function() {
    return {
        createdAt: moment.tz(this.createdAt, "America/Caracas").format('DD/MM/YYYY'),
        updatedAt: moment.tz(this.updatedAt, "America/Caracas").format('DD/MM/YYYY')
     };
};
// Índice para búsquedas comunes
entradaSchema.index({ 
    id_entrada: 'text', 
    proveedor: 'text' 
});

// Virtual para calcular el valor total de la entrada
entradaSchema.virtual('valor_total').get(function() {
    return this.cantidad * this.precio_unitario;
});

const Entrada = mongoose.model('entradas', entradaSchema);

module.exports = Entrada;