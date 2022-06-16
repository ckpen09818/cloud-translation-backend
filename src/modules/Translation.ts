import mongoose, { Schema } from 'mongoose'

export interface Translation {
  originalText: string
  text: string
  translateFrom: string
  translateTo: string
  impressions: number
  saved: boolean
}

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
  },
)

const TranslationCollection = mongoose.model('Translation', translationSchema)
export default TranslationCollection
