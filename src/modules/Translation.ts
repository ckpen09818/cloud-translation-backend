import mongoose, { Schema } from 'mongoose'

export interface Translation {
  originalText: string
  text: string
  translateFrom: string
  translateTo: string
  impressions: number
  saved: boolean
}

const REMOVE_PROPERTYS = '_id _v createdAt updatedAt'
const translationSchema = new Schema<Translation>(
  {
    originalText: { type: String, required: true },
    text: { type: String, required: true },
    translateFrom: { type: String, required: true },
    translateTo: { type: String, required: true },
    saved: {
      type: Boolean,
      default: false,
    },
    impressions: {
      type: Number,
      default: 1,
    },
  },
  {
    autoCreate: true,
    timestamps: true,
    toObject: {
      transform: function (doc, ret) {
        REMOVE_PROPERTYS.split(' ').forEach((key) => {
          delete ret[key]
        })

        return ret
      },
    },
  },
)

const TranslationCollection = mongoose.model('Translation', translationSchema)

export default TranslationCollection
