import {Database, openDatabase, SQLResultSet, SQLTransaction} from 'expo-sqlite'
import {IResult, Result, ResultError} from '../core/result'
import {Story} from '../core/story'

export class DataBaseManager {
  private db: Database
  constructor() {
    this.db = openDatabase('cache')
  }

  async init() {
    return new Promise<IResult<void>>((resolve) => {
      const error = () => resolve(new ResultError<void>(new Error('Load cached stories transaction failed')))
      const success = () => {
        return resolve(new Result<void>(undefined))
      }
      const callback = (tx: SQLTransaction) => {
        tx.executeSql(
          `
          CREATE TABLE IF NOT EXISTS stories (
            id TEXT PRIMARY KEY,
            timestamp TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT NOT NULL
          );
        `,
          [],
          success
        )
      }
      this.db.transaction(callback, error)
    })
  }

  async getStories() {
    return new Promise<IResult<Story[]>>((resolve) => {
      try {
        const error = () => resolve(new ResultError<Story[]>(new Error('Load cached stories transaction failed')))
        const success = (_: any, result: SQLResultSet) => {
          const length = result.rows.length
          const stories: Story[] = []
          for (let i = 0; i < length; i++) {
            const story: Story | null = result.rows.item(i)

            if (story) {
              stories.push(story)
            }
          }
          resolve(new Result(stories))
        }
        const callback = (tx: SQLTransaction) => {
          console.log('getStories sql')
          tx.executeSql('SELECT * FROM stories;', [], success)
        }
        this.db.transaction(callback, error)
      } catch {
        resolve(new ResultError(new Error('Getting stories from DB failed')))
      }
    })
  }
  async setStories(stories: Story[]) {
    return new Promise<IResult<void>>((resolve) => {
      if (stories.length === 0) {
        return Promise.resolve<IResult<void>>(new Result<void>(undefined))
      }
      const error = (e: any) => {
        console.log(e)
        resolve(new ResultError<void>(new Error('Setting stories to cache failed')))
      }
      const success = () => resolve(new Result<void>(undefined))
      const callback = (tx: SQLTransaction) => {
        const sql = []

        sql.push('INSERT OR REPLACE INTO stories (id, timestamp, title, description) VALUES')

        sql.push(stories.map((_) => '(?, ?, ?, ?)').join(',\n'))
        const sqlArgs = stories.reduce((result, story) => {
          result.push(story.id, story.timestamp, story.title, story.description)
          return result
        }, [] as any[])

        sql.push(';')

        tx.executeSql(sql.join('\n'), sqlArgs, success)
      }

      this.db.transaction(callback, error)
    })
  }
  async deleteStories(storyIds: string[]) {
    if (storyIds.length === 0) {
      return Promise.resolve<IResult<void>>(new Result<void>(undefined))
    }
    return new Promise<IResult<void>>((resolve) => {
      const error = (e: any) => {
        console.log(e)
        resolve(new ResultError<void>(new Error('Removing stories from cache failed')))
      }
      const success = () => resolve(new Result<void>(undefined))
      const callback = (tx: SQLTransaction) => {
        const sql = ['DELETE FROM stories WHERE id IN (']
        const args = storyIds.slice()

        sql.push(storyIds.map((_) => '?').join(', '))
        sql.push(');')

        tx.executeSql(sql.join(''), args, success)
      }

      this.db.transaction(callback, error)
    })
  }
}
