// eslint-disable-next-line
import { Knex } from 'knex'
import { User } from '../types/User'
import { Snack } from '../types/Snack'

declare module 'knex/types/tables' {
  export interface Tables {
    users: User
    snacks: Snack
  }
}
