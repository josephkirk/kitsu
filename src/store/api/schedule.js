import client from './client'

export default {
  getMilestones (production) {
    return new Promise((resolve, reject) => {
      if (production) {
        const path = `/api/data/projects/${production.id}/milestones`
        client.get(path, (err, milestones) => {
          if (err) reject(err)
          else resolve(milestones)
        })
      } else {
        resolve([])
      }
    })
  },

  createMilestone (production, milestone) {
    return new Promise((resolve, reject) => {
      const data = {
        date: milestone.date.format('YYYY-MM-DD'),
        name: milestone.name,
        task_type_id: milestone.task_type_id,
        project_id: production.id
      }
      client.post('/api/data/milestones', data, (err, milestone) => {
        if (err) reject(err)
        else resolve(milestone)
      })
    })
  },

  updateMilestone (milestone) {
    return new Promise((resolve, reject) => {
      const data = {
        date: milestone.date.format('YYYY-MM-DD'),
        name: milestone.name,
        task_type_id: milestone.task_type_id
      }
      const path = `/api/data/milestones/${milestone.id}`
      client.put(path, data, (err, milestone) => {
        if (err) reject(err)
        else resolve(milestone)
      })
    })
  },

  deleteMilestone (milestone) {
    return new Promise((resolve, reject) => {
      const path = `/api/data/milestones/${milestone.id}`
      client.del(path, (err) => {
        if (err) reject(err)
        else resolve(milestone)
      })
    })
  },

  getScheduleItems (production) {
    return new Promise((resolve, reject) => {
      client.get(
        `/api/data/projects/${production.id}/schedule-items/task-types`,
        (err, scheduleItems) => {
          if (err) reject(err)
          else resolve(scheduleItems)
        }
      )
    })
  },

  getAllScheduleItems (production) {
    return new Promise((resolve, reject) => {
      client.get(
        `/api/data/projects/${production.id}/schedule-items/`,
        (err, scheduleItems) => {
          if (err) reject(err)
          else resolve(scheduleItems)
        }
      )
    })
  },

  createScheduleItem (scheduleItem) {
    return new Promise((resolve, reject) => {
      if (!scheduleItem.endDate) {
        scheduleItem.endDate = scheduleItem.startDate.add('days', 1).clone()
      }
      const manDays = scheduleItem.man_days
      const data = {
        start_date: scheduleItem.startDate.format('YYYY-MM-DD'),
        end_date: scheduleItem.endDate.format('YYYY-MM-DD'),
        project_id: scheduleItem.project_id,
        task_type_id: scheduleItem.task_type_id
      }
      if (manDays) data.man_days = parseInt(manDays)
      client.post(
        '/api/data/schedule-items/',
        data,
        (err, scheduleItem) => {
          if (err) reject(err)
          else resolve(scheduleItem)
        }
      )
    })
  },

  deleteScheduleItem (scheduleItem) {
    return new Promise((resolve, reject) => {
      const path = `/api/data/schedule-items/${scheduleItem.id}`
      client.del(path, (err) => {
        if (err) reject(err)
        else resolve(scheduleItem)
      })
    })
  },

  getAssetTypeScheduleItems (production, taskType) {
    return this.getEntitycheduleItems(production, taskType, 'asset-types')
  },

  getSequenceScheduleItems (production, taskType) {
    return this.getEntitycheduleItems(production, taskType, 'sequences')
  },

  getEpisodeScheduleItems (production, taskType) {
    return this.getEntitycheduleItems(production, taskType, 'episodes')
  },

  getEntitycheduleItems (production, taskType, entity) {
    return new Promise((resolve, reject) => {
      client.get(
        `/api/data/projects/${production.id}/schedule-items/` +
        `${taskType.id}/${entity}`,
        (err, scheduleItems) => {
          if (err) reject(err)
          else resolve(scheduleItems)
        }
      )
    })
  },

  updateScheduleItem (scheduleItem) {
    return new Promise((resolve, reject) => {
      if (!scheduleItem.endDate) {
        scheduleItem.endDate = scheduleItem.startDate.add('days', 1).clone()
      }
      const manDays = scheduleItem.man_days
      const data = {
        start_date: scheduleItem.startDate.format('YYYY-MM-DD'),
        end_date: scheduleItem.endDate.format('YYYY-MM-DD')
      }
      if (manDays) data.man_days = parseInt(manDays)
      client.put(
        `/api/data/schedule-items/${scheduleItem.id}`,
        data,
        (err, scheduleItem) => {
          if (err) reject(err)
          else resolve(scheduleItem)
        }
      )
    })
  }

}
