import mongoose, { Schema } from 'mongoose'

export type Dict = {
  key: string
  text: string
  language: string
  count: number
}

const dictionarySchema = new Schema<Dict>(
  {
    key: String,
    text: String,
    language: String,
    count: {
      type: Number,
      default: 1,
    },
  },
  {
    autoCreate: true,
    timestamps: true,
  },
)

const DictionaryCollection = mongoose.model('Dictionary', dictionarySchema)
export default DictionaryCollection
