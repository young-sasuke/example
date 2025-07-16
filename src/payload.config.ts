// storage-adapter-import-placeholder
import { postgresAdapter } from '@payloadcms/db-postgres'
import { payloadCloudPlugin } from '@payloadcms/payload-cloud'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { User } from './collections/User'
import { Categories } from './collections/categories'
import { FeaturedProducts } from './collections/featured_products'
import { FallItems } from './collections/fall_items'
import { FabricRepairItems } from './collections/fabric_repair_items'       
import { FabricEssentials } from './collections/fabric_essentials'
import { DyeingItems } from './collections/dyeing_items'
import { DesignParts } from './collections/design_parts'
import { DeliveryStatusUpdates } from './collections/delivery_status_updates'
import { Coupons } from './collections/coupons'
import { Admins } from './collections/admins'
import { AlterationItems } from './collections/alteration_items'
import { BoysClothing } from './collections/boys_clothing'
import { CartItems } from './collections/cart_items'
import { DeliveryAssignments } from './collections/delivery_assignments'
import { DeliveryPersonnel } from './collections/delivery_personnel'
import { DeliveryImages } from './collections/delivery_images'
import {Tailors} from './collections/tailors'
import { LintRemovalItems } from './collections/lintremoval_items'
import { RafuItems } from './collections/rafu_items'
import { GirlsClothing} from './collections/girls_clothing'
import { Orders } from './collections/orders'
import { MenClothing} from './collections/men_clothing'
import { WomenClothing } from './collections/women_clothing'
import { OtpRequests} from './collections/otp_requests'
import { PicoItems } from './collections/pico_items'
import {Profiles} from './collections/profiles'
import {QuickFixOrders} from './collections/quickfix_orders'
import {ServiceAreas} from './collections/service_areas'
import {TopTailors} from './collections/top_tailors'
import {UserCoupons} from './collections/user_coupons'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, User, Categories, FeaturedProducts, FallItems, FabricRepairItems, FabricEssentials, DyeingItems, DesignParts, DeliveryStatusUpdates, Coupons, Admins, AlterationItems, BoysClothing, CartItems, DeliveryAssignments, DeliveryPersonnel, DeliveryImages, Tailors, LintRemovalItems, RafuItems, GirlsClothing, Orders, MenClothing, OtpRequests, PicoItems, Profiles, QuickFixOrders, ServiceAreas,TopTailors, UserCoupons, WomenClothing],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
  sharp,
  plugins: [
    payloadCloudPlugin(),
    // storage-adapter-placeholder
  ],
})
