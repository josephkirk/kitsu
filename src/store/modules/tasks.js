import async from 'async'

import tasksApi from '../api/tasks'
import peopleApi from '../api/people'
import playlistsApi from '../api/playlists'
import {
  sortComments,
  sortRevisionPreviewFiles,
  sortByName
} from '../../lib/sorting'
import {
  arrayMove
} from '../../lib/models'

import personStore from './people'
import taskTypeStore from './tasktypes'
import assetStore from './assets'
import shotStore from './shots'

import {
  LOAD_ASSETS_END,
  LOAD_SHOTS_END,
  CLEAR_SHOTS,
  CLEAR_ASSETS,

  LOAD_TASK_END,
  LOAD_TASK_STATUSES_END,
  LOAD_TASK_COMMENTS_END,
  LOAD_TASK_ENTITY_PREVIEW_FILES_END,
  LOAD_TASK_SUBSCRIBE_END,

  NEW_TASK_COMMENT_END,
  NEW_TASK_END,
  EDIT_TASK_END,
  EDIT_TASK_DATES,

  CREATE_TASKS_END,
  DELETE_TASK_END,
  EDIT_COMMENT_END,
  DELETE_COMMENT_END,
  PIN_COMMENT,
  ACK_COMMENT,

  PREVIEW_FILE_SELECTED,
  ADD_PREVIEW_START,
  ADD_PREVIEW_END,
  CHANGE_PREVIEW_END,
  UPDATE_PREVIEW_ANNOTATION,

  ADD_SELECTED_TASK,
  ADD_SELECTED_TASKS,
  REMOVE_SELECTED_TASK,
  CLEAR_SELECTED_TASKS,
  ASSIGN_TASKS,
  UNASSIGN_TASKS,

  SET_PREVIEW,
  SET_IS_SHOW_ASSIGNATIONS,
  SET_IS_SHOW_INFOS,
  DELETE_PREVIEW_END,

  LOAD_PERSON_TASKS_END,
  USER_LOAD_TODOS_END,

  SAVE_TASK_SEARCH_END,
  REMOVE_TASK_SEARCH_END,

  UPDATE_COMMENT_CHECKLIST,
  SET_LAST_COMMENT_DRAFT,

  REMOVE_FIRST_PREVIEW_FILE_TO_UPLOAD,
  UPDATE_REVISION_PREVIEW_POSITION,

  RESET_ALL
} from '../mutation-types'

const initialState = {
  taskMap: {},
  taskStatusMap: {},

  taskStatuses: [],
  taskComments: {},
  taskPreviews: {},
  taskEntityPreviews: {},
  selectedTasks: {},
  selectedValidations: {},
  taskSearchQueries: [],

  nbSelectedTasks: 0,
  nbSelectedValidations: 0,
  isShowAssignations: true,
  isShowInfos: true,

  isSavingCommentPreview: false,
  previewForms: [],

  lastCommentDraft: ''
}

const state = {
  ...initialState
}

const helpers = {
  getPerson (personId) {
    return personStore.getters.getPerson(
      personStore.state, personStore.getters
    )(personId)
  },

  getTaskType (taskTypeId) {
    return taskTypeStore.state.taskTypeMap[taskTypeId]
  }
}

const getters = {
  taskMap: (state) => state.taskMap,
  getTaskComments: (state, getters) => (id) => state.taskComments[id],
  getTaskPreviews: (state, getters) => (id) => state.taskPreviews[id],

  getTaskComment: (state, getters) => (taskId, commentId) => {
    if (state.taskComments[taskId]) {
      return state.taskComments[taskId].find(
        (comment) => comment.id === commentId
      )
    } else {
      return []
    }
  },

  getTaskStatus: (state, getters) => (id) => {
    return state.taskStatuses.find(
      (taskStatus) => taskStatus.id === id
    )
  },

  taskStatusOptions: state => state.taskStatuses.map((status) => {
    return {
      label: status.short_name,
      value: status.id,
      color: status.color,
      isArtistAllowed: status.is_artist_allowed
    }
  }),

  selectedTasks: state => state.selectedTasks,
  nbSelectedTasks: state => state.nbSelectedTasks,
  nbSelectedValidations: state => state.nbSelectedValidations,
  taskSearchQueries: state => state.taskSearchQueries,
  isShowAssignations: state => state.isShowAssignations,
  isShowInfos: state => state.isShowInfos,
  taskEntityPreviews: state => state.taskEntityPreviews,
  previewForms: state => state.previewForms,
  isSavingCommentPreview: state => state.isSavingCommentPreview,
  lastCommentDraft: state => state.lastCommentDraft
}

const actions = {
  loadTask ({ commit, state }, { taskId }) {
    return tasksApi.getTask(taskId)
      .then(task => {
        commit(LOAD_TASK_END, task)
        return Promise.resolve(task)
      })
  },

  loadTaskSubscribed ({ commit, state }, { taskId, callback }) {
    return tasksApi.getTaskSubscribed(taskId)
      .then(subscribed => {
        commit(LOAD_TASK_SUBSCRIBE_END, { taskId, subscribed })
        return Promise.resolve(subscribed)
      })
  },

  subscribeToTask ({ commit, state }, taskId) {
    return tasksApi.subscribeToTask(taskId)
      .then(() => {
        commit(LOAD_TASK_SUBSCRIBE_END, { taskId, subscribed: true })
        return Promise.resolve(true)
      })
  },

  unsubscribeFromTask ({ commit, state }, taskId) {
    return tasksApi.unsubscribeFromTask(taskId)
      .then(() => {
        commit(LOAD_TASK_SUBSCRIBE_END, { taskId, subscribed: false })
        return Promise.resolve(false)
      })
  },

  loadTaskComments (
    { commit, state, dispatch },
    { taskId, entityId, callback }
  ) {
    return tasksApi.getTaskComments(taskId)
      .then(comments => {
        commit(LOAD_TASK_COMMENTS_END, { comments, taskId })
        return dispatch('loadTaskEntityPreviewFiles', entityId)
      })
  },

  loadTaskEntityPreviewFiles ({ commit, state }, entityId) {
    const entity = { id: entityId }
    return playlistsApi.getEntityPreviewFiles(entity)
      .then((previewFiles) => {
        commit(LOAD_TASK_ENTITY_PREVIEW_FILES_END, previewFiles)
        return Promise.resolve(previewFiles)
      })
  },

  commentTask (
    { commit, state },
    { taskId, taskStatusId, comment, attachment, checklist }
  ) {
    return tasksApi.commentTask(
      { taskId, taskStatusId, comment, attachment, checklist }
    )
      .then((comment) => {
        commit(NEW_TASK_COMMENT_END, { comment, taskId })
      })
  },

  loadComment ({ commit, state }, { commentId, callback }) {
    return tasksApi.getTaskComment({ id: commentId })
      .then(comment => {
        commit(NEW_TASK_COMMENT_END, { comment, taskId: comment.object_id })
        return Promise.resolve(comment)
      })
  },

  createTasks ({ commit, state },
    payload
  ) {
    let entityIds = []
    if (payload.selectionOnly) {
      if (payload.type === 'shots') {
        entityIds = shotStore.cache.result.map(shot => shot.id)
      } else {
        entityIds = assetStore.cache.result.map(asset => asset.id)
      }
    }
    const data = {
      task_type_id: payload.task_type_id,
      type: payload.type,
      project_id: payload.project_id,
      entityIds
    }
    return tasksApi.createTasks(data)
  },

  createSelectedTasks (
    { commit, state },
    { type, projectId, callback }
  ) {
    async.eachSeries(Object.keys(state.selectedValidations), (key, next) => {
      const validationInfo = state.selectedValidations[key]
      const data = {
        entity_id: validationInfo.entity.id,
        task_type_id: validationInfo.column.id,
        type: type,
        project_id: projectId
      }
      tasksApi.createTask(data, (err, tasks) => {
        commit(CREATE_TASKS_END, tasks)
        tasks.forEach((task) => {
          commit(REMOVE_SELECTED_TASK, validationInfo)
          task.assigneesInfo = []
          validationInfo.task = task
          commit(ADD_SELECTED_TASK, validationInfo)
        })
        next(err, tasks[0])
      })
    }, callback)
  },

  deleteSelectedTasks ({ commit, state }) {
    return new Promise((resolve, reject) => {
      const selectedTaskIds = Object.keys(state.selectedTasks)
      async.eachSeries(selectedTaskIds, (taskId, next) => {
        const task = state.taskMap[taskId]
        if (task) {
          tasksApi.deleteTask(task, (err) => {
            if (!err) commit(DELETE_TASK_END, task)
            next(err)
          })
        } else {
          next()
        }
      }, (err) => {
        if (err) reject(err)
        else {
          resolve()
        }
      })
    })
  },

  deleteAllTasks ({ commit, state }, { projectId, taskTypeId, taskIds }) {
    return tasksApi.deleteAllTasks(projectId, taskTypeId, taskIds)
  },

  createTask (
    { commit, state, rootGetters },
    { entityId, projectId, taskTypeId, type }
  ) {
    return new Promise((resolve, reject) => {
      const data = {
        entity_id: entityId,
        task_type_id: taskTypeId,
        type: type,
        project_id: projectId
      }
      tasksApi.createTask(data, (err, tasks) => {
        if (err) {
          reject(err)
        } else {
          commit(NEW_TASK_END, tasks[0])
          resolve()
        }
      })
    })
  },

  changeSelectedTaskStatus ({ commit, state, rootGetters }, {
    taskStatusId,
    comment
  }) {
    const tasksToChange = []
    const production = rootGetters.currentProduction
    Object.keys(state.selectedTasks).forEach((taskId) => {
      const task = state.taskMap[taskId]
      const isChanged = task && (
        task.task_status_id !== taskStatusId ||
        (comment && comment.length > 0)
      )
      if (isChanged) {
        tasksToChange.push({
          object_id: taskId,
          task_status_id: taskStatusId,
          comment: comment || '',
          checklist: []
        })
      }
    })
    return tasksApi.commentTasks(production.id, tasksToChange)
      .then((comments) => {
        comments.forEach(comment => {
          commit(
            NEW_TASK_COMMENT_END,
            { comment, taskId: comment.object_id }
          )
        })
        return Promise.resolve(comments)
      })
  },

  changeSelectedPriorities (
    { commit, state, rootGetters },
    { priority, callback }
  ) {
    async.eachSeries(Object.keys(state.selectedTasks), (taskId, next) => {
      const task = state.taskMap[taskId]
      const taskType = rootGetters.taskTypeMap[task.task_type_id]

      if (task && task.priority !== priority) {
        tasksApi.updateTask(taskId, { priority })
          .then(task => {
            commit(EDIT_TASK_END, { task, taskType })
            next()
          })
          .catch(next)
      } else {
        next()
      }
    }, (err) => {
      callback(err)
    })
  },

  updateTask ({ commit }, { taskId, data }) {
    commit(EDIT_TASK_DATES, { taskId, data })
    return tasksApi.updateTask(taskId, data)
      .then((task) => {
        commit(EDIT_TASK_DATES, { taskId, data })
      })
  },

  getTask ({ commit, rootGetters }, { taskId, callback }) {
    tasksApi.getTask(taskId, (err, task) => {
      if (!err) {
        const taskType = rootGetters.taskTypeMap[task.task_type_id]
        commit(EDIT_TASK_END, { task, taskType })
      }
      if (callback) callback(err)
    })
  },

  deleteTask ({ commit }, { task, callback }) {
    tasksApi.deleteTask(task, (err) => {
      if (!err) {
        commit(DELETE_TASK_END, task)
      }
      if (callback) callback(err)
    })
  },

  editTaskComment ({ commit }, { taskId, comment, checklist }) {
    checklist = checklist || comment.checklist
    return tasksApi.editTaskComment(comment)
      .then(comment => {
        commit(EDIT_COMMENT_END, { taskId, comment, checklist })
        return Promise.resolve(comment)
      })
  },

  deleteTaskComment ({ commit, rootState }, { taskId, commentId, callback }) {
    const todoStatus = rootState.taskStatus.taskStatus.find((taskStatus) => {
      return taskStatus.short_name === 'todo'
    })
    return tasksApi.deleteTaskComment(taskId, commentId)
      .then(() => {
        commit(DELETE_COMMENT_END, {
          commentId,
          taskId,
          taskStatusMap: rootState.taskStatus.taskStatusMap,
          todoStatus
        })
        return Promise.resolve()
      })
  },

  commentTaskWithPreview (
    { commit, getters, state, dispatch },
    { taskId, comment, taskStatusId, form, attachment, checklist }
  ) {
    const data = { taskId, taskStatusId, comment, attachment, checklist }
    commit(ADD_PREVIEW_START)
    let newComment
    return tasksApi.commentTask(data)
      .then((comment) => {
        newComment = comment
        const previewData = {
          taskId,
          commentId: newComment.id
        }
        return tasksApi.addPreview(previewData)
      }).then(preview => {
        if (!form) form = state.previewForms[0]
        return tasksApi.uploadPreview(preview.id, form)
      }).then(preview => {
        commit(NEW_TASK_COMMENT_END, { comment: newComment, taskId })
        commit(ADD_PREVIEW_END, {
          preview,
          taskId,
          commentId: newComment.id,
          comment: newComment
        })
        if (state.previewForms.length > 1) {
          commit(REMOVE_FIRST_PREVIEW_FILE_TO_UPLOAD)
          dispatch('addCommentExtraPreview', {
            taskId,
            commentId: newComment.id,
            previewId: preview.id
          })
        }
        return Promise.resolve({ newComment, preview })
      })
  },

  addCommentExtraPreview (
    { commit, getters, state },
    { taskId, commentId, previewId }
  ) {
    const addPreview = (form) => {
      return tasksApi
        .addExtraPreview(previewId, taskId, commentId)
        .then(preview => tasksApi.uploadPreview(preview.id, form))
        .then((preview) => {
          const comment = getters.getTaskComment(taskId, commentId)
          commit(ADD_PREVIEW_END, {
            preview,
            taskId,
            commentId,
            comment
          })
          return Promise.resolve(preview)
        })
    }
    return state.previewForms.reduce((accumulatorPromise, form) => {
      return accumulatorPromise.then(() => {
        return addPreview(form)
      })
    }, Promise.resolve())
  },

  deleteTaskPreview ({ commit, state }, { taskId, commentId, previewId }) {
    return tasksApi.deletePreview(taskId, commentId, previewId)
      .then(() => {
        commit(DELETE_PREVIEW_END, { taskId, previewId })
        return Promise.resolve(previewId)
      })
  },

  setPreview ({ commit, state }, { taskId, entityId, previewId }) {
    const taskMap = state.taskMap
    return tasksApi
      .setPreview(entityId, previewId)
      .then((entity) => {
        commit(SET_PREVIEW, { taskId, entityId, previewId, taskMap })
        return Promise.resolve()
      })
  },

  updatePreviewAnnotation ({ commit, state }, {
    taskId, preview, annotations
  }) {
    return tasksApi.updatePreviewAnnotation(preview, annotations)
      .then(updatedPreview => {
        commit(UPDATE_PREVIEW_ANNOTATION, {
          taskId,
          preview,
          annotations
        })
        return Promise.resolve(updatedPreview)
      })
      .catch(console.error)
  },

  refreshPreview ({ commit, state }, { taskId, previewId }) {
    return tasksApi.getPreviewFile(previewId)
      .then((preview) => {
        commit(UPDATE_PREVIEW_ANNOTATION, {
          taskId,
          preview,
          annotations: preview.annotations
        })
        return Promise.resolve()
      })
  },

  assignSelectedTasks ({ commit, state }, { personId, callback }) {
    const selectedTaskIds = Object.keys(state.selectedTasks)
    tasksApi.assignTasks(personId, selectedTaskIds, (err) => {
      if (!err) commit(ASSIGN_TASKS, { selectedTaskIds, personId })
      if (callback) callback(err)
    })
  },

  unassignSelectedTasks ({ commit, state }, { personId, callback }) {
    const selectedTaskIds = Object.keys(state.selectedTasks)
    tasksApi.unassignTasks(selectedTaskIds, (err) => {
      if (!err) commit(UNASSIGN_TASKS, selectedTaskIds)
      if (callback) callback(err)
    })
  },

  showAssignations ({ commit, state }) {
    commit(SET_IS_SHOW_ASSIGNATIONS, true)
  },

  hideAssignations ({ commit, state }) {
    commit(SET_IS_SHOW_ASSIGNATIONS, false)
  },

  showInfos ({ commit, state }) {
    commit(SET_IS_SHOW_INFOS, true)
  },

  hideInfos ({ commit, state }) {
    commit(SET_IS_SHOW_INFOS, false)
  },

  loadPreviewFileFormData ({ commit }, previewForms) {
    commit(PREVIEW_FILE_SELECTED, previewForms)
  },

  addSelectedTask ({ commit }, task) {
    commit(ADD_SELECTED_TASK, task)
  },

  addSelectedTasks ({ commit }, selection) {
    commit(ADD_SELECTED_TASKS, selection)
  },

  clearSelectedTasks ({ commit }, selection) {
    commit(CLEAR_SELECTED_TASKS, selection)
  },

  removeSelectedTask ({ commit }, task) {
    commit(REMOVE_SELECTED_TASK, task)
  },

  saveTaskSearch ({ commit, rootGetters }, { searchQuery, entityType }) {
    return new Promise((resolve, reject) => {
      const query = state.taskSearchQueries.find(
        (query) => query.name === searchQuery
      )
      const production = rootGetters.currentProduction

      if (!query) {
        peopleApi.createFilter(
          'task',
          searchQuery,
          searchQuery,
          production.id,
          entityType,
          (err, searchQuery) => {
            commit(SAVE_TASK_SEARCH_END, { searchQuery, production })
            if (err) {
              reject(err)
            } else {
              resolve(searchQuery)
            }
          }
        )
      } else {
        resolve()
      }
    })
  },

  removeTaskSearch ({ commit, rootGetters }, searchQuery) {
    const production = rootGetters.currentProduction
    return peopleApi.removeFilter(searchQuery)
      .then(() => {
        commit(REMOVE_TASK_SEARCH_END, { searchQuery, production })
        return Promise.resolve(searchQuery)
      })
  },

  ackComment ({ commit, rootGetters }, comment) {
    const user = rootGetters.user
    commit(ACK_COMMENT, { comment, user })
    return tasksApi.ackComment(comment)
  },

  pinComment ({ commit }, comment) {
    commit(PIN_COMMENT, comment)
    return tasksApi.pinComment(comment)
  },

  updateRevisionPreviewPosition ({ commit }, payload) {
    if (payload.newIndex < payload.previousIndex) payload.newIndex++
    commit(UPDATE_REVISION_PREVIEW_POSITION, payload)
    return tasksApi.updateRevisionPreviewPosition(
      payload.previewId,
      payload.newIndex
    )
  }
}

const mutations = {

  [LOAD_ASSETS_END] (state, { production, userFilters }) {
    if (userFilters.task && userFilters.task[production.id]) {
      state.taskSearchQueries = userFilters.task[production.id]
    } else {
      state.taskSearchQueries = []
    }
  },

  [LOAD_SHOTS_END] (state, { production, userFilters }) {
    if (userFilters.task && userFilters.task[production.id]) {
      state.taskSearchQueries = userFilters.task[production.id]
    } else {
      state.taskSearchQueries = []
    }
  },

  [LOAD_TASK_END] (state, task) {
    Object.assign(task, {
      project_name: task.project.name,
      entity_type_name: task.entity_type.name
    })
    if (task.entity_type.name === 'Shot') {
      if (task.episode) {
        task.entity_name = `${task.episode.name} / ${task.sequence.name} / ${task.entity.name}`
      } else {
        task.entity_name = `${task.sequence.name} / ${task.entity.name}`
      }
    } else {
      task.entity_name = `${task.entity_type.name} / ${task.entity.name}`
    }
    if (!state.taskMap[task.id]) {
      state.taskMap[task.id] = task
    } else {
      Object.assign(state.taskMap[task.id], task)
    }
  },

  [LOAD_TASK_ENTITY_PREVIEW_FILES_END] (state, previewFiles) {
    state.taskEntityPreviews = previewFiles
  },

  [LOAD_TASK_COMMENTS_END] (state, { taskId, comments }) {
    comments.forEach((comment) => {
      comment.person = personStore.helpers.addAdditionalInformation(
        comment.person
      )
    })
    state.taskComments[taskId] = sortComments(comments)
    state.taskPreviews[taskId] = comments.reduce((previews, comment) => {
      if (comment.previews && comment.previews.length > 0) {
        const preview = comment.previews[0]
        preview.previews = sortRevisionPreviewFiles(comment.previews
          .map((p) => {
            return {
              id: p.id,
              annotations: p.annotations,
              extension: p.extension,
              task_id: p.task_id,
              status: p.status,
              revision: p.revision,
              position: p.position,
              original_name: p.original_name
            }
          })
        )
        previews.push(preview)
        return previews
      } else {
        return previews
      }
    }, [])
  },

  [LOAD_TASK_STATUSES_END] (state, taskStatuses) {
    state.taskStatuses = sortByName(taskStatuses)
    state.taskStatuses.forEach((taskStatus) => {
      state.taskStatusMap[taskStatus.id] = taskStatus
    })
  },

  [LOAD_TASK_SUBSCRIBE_END] (state, { taskId, subscribed }) {},

  [NEW_TASK_COMMENT_END] (state, { comment, taskId }) {
    const task = state.taskMap[taskId]
    if (comment.task_status === undefined) {
      const getTaskStatus = getters.getTaskStatus(state, getters)
      comment.task_status = getTaskStatus(comment.task_status_id)
    }

    if (comment.person === undefined) {
      const getPerson = personStore.getters.getPerson(
        personStore.state, personStore.getters
      )
      comment.person = getPerson(comment.person_id)
    }

    comment.person = personStore.helpers.addAdditionalInformation(
      comment.person
    )

    if (!state.taskComments[taskId]) state.taskComments[taskId] = []
    if (!state.taskComments[taskId].find((cmt) => cmt.id === comment.id)) {
      state.taskComments[taskId].unshift(comment)
    }
    state.taskComments[taskId] = sortComments(state.taskComments[taskId])
    if (task) {
      Object.assign(task, {
        task_status_id: comment.task_status_id,
        last_comment: comment
      })
    }
  },

  [DELETE_TASK_END] (state, task) {
    state.taskComments[task.id] = undefined
    state.taskPreviews[task.id] = undefined
    state.taskMap[task.id] = undefined
    const validationKey = `${task.entity_id}-${task.task_type_id}`
    state.selectedValidations[validationKey] = {
      entity: { id: task.entity_id },
      column: { id: task.task_type_id }
    }
    delete state.selectedTasks[task.id]
  },

  [DELETE_COMMENT_END] (state, {
    taskId,
    commentId,
    taskStatusMap,
    todoStatus
  }) {
    const task = state.taskMap[taskId]
    let comments = state.taskComments[taskId]
    const oldCommentIndex = comments.findIndex(c => c.id === commentId)
    const oldComment = comments.find(c => c.id === commentId)
    const pinnedCount = comments.filter(c => c.pinned).length

    comments = comments.filter(
      c => c.id !== commentId
    )
    state.taskComments[taskId] = comments
    state.taskPreviews[taskId] = [...state.taskPreviews[taskId]].filter(
      p => !(
        oldComment.previews.length > 0 &&
        oldComment.previews[0].id === p.id
      )
    )

    if (oldCommentIndex === pinnedCount) {
      let newStatus = todoStatus
      if (comments.length > 0) {
        let newStatusId = comments[0].task_status_id
        if (pinnedCount < comments.length) {
          newStatusId = comments[pinnedCount].task_status_id
        }
        newStatus = taskStatusMap[newStatusId]
      }

      if (task) {
        Object.assign(task, {
          task_status_id: newStatus.id,
          task_status_priority: newStatus.priority
        })
      }
    }
  },

  [EDIT_COMMENT_END] (state, { taskId, comment, checklist }) {
    const oldComment = state.taskComments[taskId].find(
      c => c.id === comment.id
    )
    Object.assign(oldComment, {
      text: comment.text,
      task_status_id: comment.task_status_id,
      task_status: state.taskStatusMap[comment.task_status_id],
      checklist: checklist || []
    })
  },

  [PREVIEW_FILE_SELECTED] (state, forms) {
    state.previewForms = forms
  },

  [ADD_PREVIEW_START] (state) {
    state.isSavingCommentPreview = true
  },

  [ADD_PREVIEW_END] (state, { preview, taskId, commentId, comment }) {
    state.isSavingCommentPreview = false
    const newPreview = {
      id: preview.id,
      feedback: false,
      revision: preview.revision,
      status: preview.status,
      position: preview.position,
      original_name: preview.original_name,
      extension: preview.extension,
      task_id: taskId
    }

    if (state.taskPreviews[taskId]) {
      const existingPreview = state.taskPreviews[taskId].find(
        (p) => p.revision === preview.revision
      )

      if (existingPreview) {
        const existingSubPreview =
          existingPreview.previews.find((p) => p.id === newPreview.id)
        if (!existingSubPreview) {
          existingPreview.previews.push(newPreview)
        }
      } else {
        newPreview.previews = [{ ...newPreview }]
        state.taskPreviews[taskId] =
          [newPreview].concat(state.taskPreviews[taskId])

        comment.preview = newPreview
        comment.previews = [newPreview]
      }
    }
  },

  [DELETE_PREVIEW_END] (state, { taskId, previewId }) {
    state.taskPreviews[taskId].forEach((p) => {
      const index =
        p.previews.findIndex((subPreview) => subPreview.id === previewId)
      if (index >= 0) {
        p.previews.splice(index, 1)
      }
    })
  },

  [UPDATE_PREVIEW_ANNOTATION] (state, { taskId, preview, annotations }) {
    preview.annotations = annotations
    state.taskPreviews[taskId].forEach(p => {
      p.previews.forEach(subPreview => {
        if (subPreview.id === preview.id) {
          subPreview.annotations = annotations
          subPreview.status = preview.status
        }
      })

      if (p.id === preview.id) {
        p.annotations = annotations
        p.status = preview.status
      }
    })
  },

  [CHANGE_PREVIEW_END] (state, { preview, comment }) {
    const taskId = comment.object_id

    const newPreview = {
      id: preview.id,
      feedback: false,
      revision: preview.revision,
      position: preview.position,
      original_name: preview.original_name,
      extension: preview.extension
    }
    state.taskPreviews[taskId].shift()
    state.taskPreviews[taskId] =
      [newPreview].concat(state.taskPreviews[taskId])
  },

  [ADD_SELECTED_TASK] (state, validationInfo) {
    if (validationInfo.task) {
      state.selectedTasks[validationInfo.task.id] = validationInfo.task
      state.nbSelectedTasks = Object.keys(state.selectedTasks).length
    } else {
      const taskTypeId = validationInfo.column.id
      const entityId = validationInfo.entity.id
      const validationKey = `${entityId}-${taskTypeId}`
      state.selectedValidations[validationKey] = validationInfo
      state.nbSelectedValidations =
        Object.keys(state.selectedValidations).length
    }
  },

  [ADD_SELECTED_TASKS] (state, selection) {
    const tmpSelectedTasks = JSON.parse(JSON.stringify(state.selectedTasks))
    const tmpSelectedValidations =
      JSON.parse(JSON.stringify(state.selectedValidations))
    let isValidationChanged = false
    selection.forEach((validationInfo) => {
      if (validationInfo.task) {
        tmpSelectedTasks[validationInfo.task.id] = validationInfo.task
      } else {
        const taskTypeId = validationInfo.column.id
        const entityId = validationInfo.entity.id
        const validationKey = `${entityId}-${taskTypeId}`
        tmpSelectedValidations[validationKey] = validationInfo
        isValidationChanged = true
      }
    })
    state.selectedTasks = tmpSelectedTasks
    state.nbSelectedTasks = Object.keys(state.selectedTasks).length
    if (isValidationChanged) {
      state.selectedValidations = tmpSelectedValidations
      state.nbSelectedValidations =
        Object.keys(state.selectedValidations).length
    }
  },

  [REMOVE_SELECTED_TASK] (state, validationInfo) {
    if (validationInfo.task) {
      delete state.selectedTasks[validationInfo.task.id]
      state.nbSelectedTasks = Object.keys(state.selectedTasks).length
    } else {
      const taskTypeId = validationInfo.column.id
      const entityId = validationInfo.entity.id
      const validationKey = `${entityId}-${taskTypeId}`
      delete state.selectedValidations[validationKey]
      state.nbSelectedValidations = Object.keys(state.selectedValidations).length
    }
  },

  [CLEAR_SELECTED_TASKS] (state) {
    state.selectedTasks = {}
    state.nbSelectedTasks = 0
    state.selectedValidations = {}
    state.nbSelectedValidations = 0
  },

  [CREATE_TASKS_END] (state, tasks) {
    tasks.forEach((task) => {
      state.taskMap[task.id] = task
    })
  },

  [NEW_TASK_END] (state, task) {
    state.taskMap[task.id] = task
  },

  [EDIT_TASK_END] (state, { task }) {
    const currentTask = state.taskMap[task.id]
    if (currentTask) {
      Object.assign(state.taskMap[task.id], {
        task_status_id: task.task_status_id,
        task_status_short_name:
          state.taskStatusMap[task.task_status_id].short_name,
        priority: task.priority,
        estimation: task.estimation,
        duration: task.duration,
        real_start_date: task.real_start_date,
        end_date: task.end_date,
        due_date: task.due_date,
        real_end_date: task.end_date,
        last_comment_date: task.last_comment_date,
        retake_count: task.retake_count
      })
    }
  },

  [EDIT_TASK_DATES] (state, { taskId, data }) {
    const task = state.taskMap[taskId]
    Object.assign(task, data)
  },

  [ASSIGN_TASKS] (state, { selectedTaskIds, personId }) {
    selectedTaskIds.forEach((taskId) => {
      const task = state.taskMap[taskId]
      if (task &&
          !task.assignees.find((assigneeId) => assigneeId === personId)) {
        task.assignees.push(personId)
        task.assignees = [...task.assignees]
      }
    })
  },

  [UNASSIGN_TASKS] (state, selectedTaskIds) {
    selectedTaskIds.forEach((taskId) => {
      const task = state.taskMap[taskId]
      task.assignees = []
      task.assigneesInfo = []
    })
  },

  [SET_PREVIEW] (state, { taskId, previewId }) {
    if (state.taskMap[taskId]) {
      state.taskMap[taskId].entity.preview_file_id = previewId
    }
  },

  [SET_IS_SHOW_ASSIGNATIONS] (state, isShowAssignations) {
    state.isShowAssignations = isShowAssignations
  },

  [SET_IS_SHOW_INFOS] (state, isShowInfos) {
    state.isShowInfos = isShowInfos
  },

  [LOAD_PERSON_TASKS_END] (state, { tasks }) {
    tasks.forEach((task) => {
      if (task.last_comment.person_id) {
        const person = helpers.getPerson(task.last_comment.person_id)
        task.last_comment.person = person
      }
      state.taskMap[task.id] = task
    })
  },

  [USER_LOAD_TODOS_END] (state, { tasks }) {
    tasks.forEach((task) => {
      if (task.last_comment.person_id) {
        const person = helpers.getPerson(task.last_comment.person_id)
        task.last_comment.person = person
      }
      state.taskMap[task.id] = task
    })
  },

  [SAVE_TASK_SEARCH_END] (state, { searchQuery }) {
    if (!state.taskSearchQueries.includes(searchQuery)) {
      state.taskSearchQueries.push(searchQuery)
      state.taskSearchQueries = sortByName(state.taskSearchQueries)
    }
  },

  [REMOVE_TASK_SEARCH_END] (state, { searchQuery }) {
    const queryIndex = state.taskSearchQueries.findIndex(
      (query) => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.taskSearchQueries.splice(queryIndex, 1)
    }
  },

  [PIN_COMMENT] (state, comment) {
    comment.pinned = !comment.pinned
    state.taskComments[comment.object_id] =
      sortComments(state.taskComments[comment.object_id])
  },

  [ACK_COMMENT] (state, { comment, user }) {
    if (comment.acknowledgements.includes(user.id)) {
      comment.acknowledgements = comment.acknowledgements.filter(
        personId => personId !== user.id
      )
    } else {
      comment.acknowledgements.push(user.id)
    }
    state.taskComments[comment.object_id] =
      sortComments(state.taskComments[comment.object_id])
  },

  [UPDATE_COMMENT_CHECKLIST] (state, { comment, checklist }) {
    comment.checklist = [...checklist]
    state.taskComments[comment.object_id].checklist = [...checklist]
  },

  [CLEAR_ASSETS] (state) {
    state.taskMap = {}
  },

  [CLEAR_SHOTS] (state) {
    state.taskMap = {}
  },

  [SET_LAST_COMMENT_DRAFT] (state, lastCommentDraft) {
    state.lastCommentDraft = lastCommentDraft
  },

  [UPDATE_REVISION_PREVIEW_POSITION] (state, {
    previousIndex,
    newIndex,
    revision,
    taskId
  }) {
    const preview = state.taskPreviews[taskId].find(
      p => p.revision === revision
    )
    preview.previews = arrayMove(preview.previews, previousIndex, newIndex)
    let i = 1
    preview.previews.forEach(preview => {
      preview.position = i
      i++
    })
  },

  [REMOVE_FIRST_PREVIEW_FILE_TO_UPLOAD] (state) {
    state.previewForms = state.previewForms.splice(1)
  },

  [RESET_ALL] (state, shots) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
