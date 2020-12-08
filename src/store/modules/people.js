import Vue from 'vue'
import peopleApi from '../api/people'
import colors from '../../lib/colors'
import { clearSelectionGrid } from '../../lib/selection'
import { populateTask } from '../../lib/models'
import { sortTasks, sortPeople, sortByName } from '../../lib/sorting'
import {
  indexSearch,
  buildTaskIndex,
  buildNameIndex
} from '../../lib/indexing'
import {
  getKeyWords
} from '../../lib/filtering'

import taskStatusStore from './taskstatus'
import {
  LOAD_PEOPLE_START,
  LOAD_PEOPLE_ERROR,
  LOAD_PEOPLE_END,

  SHOW_IMPORT_PEOPLE_MODAL,
  HIDE_IMPORT_PEOPLE_MODAL,
  PERSON_CSV_FILE_SELECTED,
  IMPORT_PEOPLE_START,
  IMPORT_PEOPLE_ERROR,
  IMPORT_PEOPLE_END,

  UPLOAD_AVATAR_END,
  USER_SAVE_PROFILE_SUCCESS,

  LOAD_PERSON_TASKS_END,
  LOAD_PERSON_DONE_TASKS_END,

  EDIT_PEOPLE_END,
  DELETE_PEOPLE_END,

  SET_PERSON_TASKS_SEARCH,
  SAVE_PERSON_TASKS_SEARCH_END,
  REMOVE_PERSON_TASKS_SEARCH_END,
  NEW_TASK_COMMENT_END,

  ADD_SELECTED_TASK,
  REMOVE_SELECTED_TASK,
  CLEAR_SELECTED_TASKS,

  SET_TIME_SPENT,
  PEOPLE_TIMESHEET_LOADED,
  PERSON_LOAD_TIME_SPENTS_END,

  SET_ORGANISATION,

  SET_PERSON_TASKS_SCROLL_POSITION,

  PEOPLE_SEARCH_CHANGE,

  RESET_ALL
} from '../mutation-types'

const helpers = {
  addAdditionalInformation (person) {
    if (person) {
      if (person.first_name && person.last_name) {
        person.name = `${person.first_name} ${person.last_name}`
        person.initials = `${person.first_name[0]}${person.last_name[0]}`
      } else if (person.first_name) {
        person.name = person.first_name
        person.initials = person.first_name[0]
      } else if (person.last_name) {
        person.name = person.last_name
        person.initials = person.last_name[0]
      } else if (person.email) {
        person.name = person.email
        person.initials = person.email[0]
      } else {
        person.initials = 'NN'
      }

      Vue.set(person, 'initials', person.initials.toUpperCase())
      person.color = colors.fromString(person.name)
      if (person.has_avatar && !person.uniqueHash) {
        const randomHash = Math.random().toString(36).substring(7)
        Vue.set(person, 'uniqueHash', randomHash)
        person.avatarPath =
          `/api/pictures/thumbnails/persons/${person.id}.png`
      }
    }
    return person
  },

  getTaskStatus (taskStatusId) {
    return taskStatusStore.state.taskStatusMap[taskStatusId]
  }
}

const initialState = {
  organisation: {
    name: 'Kitsu',
    hours_by_day: 8,
    has_avatar: false,
    use_original_file_name: 'false'
  },

  people: [],
  displayedPeople: [],
  peopleSearchText: '',
  peopleIndex: {},
  personMap: {},
  isPeopleLoading: false,
  isPeopleLoadingError: true,

  isImportPeopleModalShown: false,
  isImportPeopleLoading: false,
  isImportPeopleLoadingError: false,

  isEditModalShown: false,
  isEditLoading: false,
  isEditLoadingError: false,

  isDeleteModalShown: false,
  isDeleteLoading: false,
  isDeleteLoadingError: false,

  personCsvFormData: undefined,

  person: {},
  personTasks: [],
  displayedPersonTasks: [],
  displayedPersonDoneTasks: [],
  personTasksIndex: {},
  personTasksSearchText: '',
  personTaskSelectionGrid: {},
  personTaskSearchQueries: [],
  personTasksScrollPosition: 0,

  timesheet: {},
  personTimeSpentMap: {},
  personTimeSpentTotal: 0
}

const state = {
  ...initialState
}

const getters = {
  organisation: state => state.organisation,

  people: state => state.people,
  displayedPeople: state => state.displayedPeople,
  peopleIndex: state => state.peopleIndex,
  personMap: state => state.personMap,
  isPeopleLoading: state => state.isPeopleLoading,
  isPeopleLoadingError: state => state.isPeopleLoadingError,

  isImportPeopleModalShown: state => state.isImportPeopleModalShown,
  isImportPeopleLoading: state => state.isImportPeopleLoading,
  isImportPeopleLoadingError: state => state.isImportPeopleLoadingError,

  isDeleteModalShown: state => state.isDeleteModalShown,
  isDeleteLoading: state => state.isDeleteLoading,
  isDeleteLoadingError: state => state.isDeleteLoadingError,

  isEditModalShown: state => state.isEditModalShown,
  isEditLoading: state => state.isEditLoading,
  isEditLoadingError: state => state.isEditLoadingError,

  personCsvFormData: state => state.personCsvFormData,

  displayedPersonTasks: state => state.displayedPersonTasks,
  displayedPersonDoneTasks: state => state.displayedPersonDoneTasks,
  personTasksSearchText: state => state.personTasksSearchText,
  personTaskSearchQueries: state => state.personTaskSearchQueries,
  personTaskSelectionGrid: state => state.personTaskSelectionGrid,
  personTasksScrollPosition: state => state.personTasksScrollPosition,

  getPerson: (state, getters) => (id) => state.personMap[id],
  getPersonOptions: state => state.people.map(
    (person) => {
      return {
        label: `${person.first_name} ${person.last_name}`,
        value: person.id
      }
    }
  ),

  timesheet: state => state.timesheet,
  personTimeSpentMap: state => state.personTimeSpentMap,
  personTimeSpentTotal: state => state.personTimeSpentTotal
}

const actions = {

  getOrganisation ({ commit }) {
    return peopleApi.getOrganisation()
      .then((organisation) => {
        commit(SET_ORGANISATION, organisation)
      })
  },

  saveOrganisation ({ commit }, form) {
    form.id = state.organisation.id
    return peopleApi.updateOrganisation(form)
      .then((organisation) => {
        commit(SET_ORGANISATION, organisation)
        Promise.resolve(organisation)
      })
  },

  uploadOrganisationLogo ({ commit, state }, formData) {
    return new Promise((resolve, reject) => {
      const organisationId = state.organisation.id
      peopleApi.postOrganisationLogo(organisationId, formData)
        .then((organisation) => {
          commit(SET_ORGANISATION, { has_avatar: true })
          resolve()
        })
        .catch(reject)
    })
  },

  loadPeople ({ commit, state }, callback) {
    commit(LOAD_PEOPLE_START)
    peopleApi.getPeople((err, people) => {
      if (err) {
        commit(LOAD_PEOPLE_ERROR)
      } else {
        commit(LOAD_PEOPLE_END, people.map((person) => {
          person.departments = person.departments || ''
          return person
        }))
      }
      if (callback) callback(err)
    })
  },

  loadPerson ({ commit, state }, personId) {
    peopleApi.getPerson(personId, (err, person) => {
      if (err) console.error(err)
    })
  },

  newPerson ({ commit, state }, data) {
    return peopleApi.createPerson(data)
      .then((person) => {
        commit(EDIT_PEOPLE_END, person)
        Promise.resolve()
      })
  },

  newPersonAndInvite ({ commit, state }, data) {
    return peopleApi.createPerson(data)
      .then(peopleApi.invitePerson)
      .then((person) => {
        commit(EDIT_PEOPLE_END, person)
        Promise.resolve()
      })
  },

  invitePerson ({ commit, state }, person) {
    return peopleApi.invitePerson(person)
  },

  editPerson ({ commit, state }, data) {
    return peopleApi.updatePerson(data)
      .then((person) => {
        commit(EDIT_PEOPLE_END, person)
        Promise.resolve()
      })
  },

  deletePeople ({ commit, state }, person) {
    return peopleApi.deletePerson(person)
      .then(() => {
        commit(DELETE_PEOPLE_END)
        Promise.resolve()
      })
  },

  uploadPersonFile ({ commit, state }, toUpdate) {
    commit(IMPORT_PEOPLE_START)
    return peopleApi.postCsv(state.personCsvFormData, toUpdate)
      .then(() => {
        commit(IMPORT_PEOPLE_END)
        Promise.resolve()
      })
      .catch((err) => {
        commit(IMPORT_PEOPLE_ERROR)
        Promise.reject(err)
      })
  },

  loadPersonTasks (
    { commit, state, rootGetters }, { personId, forced, date, callback }
  ) {
    const userFilters = rootGetters.userFilters
    const taskTypeMap = rootGetters.taskTypeMap
    commit(
      LOAD_PERSON_TASKS_END,
      { personId, tasks: [], userFilters, taskTypeMap }
    )
    commit(LOAD_PERSON_DONE_TASKS_END, [])
    peopleApi.getPersonTasks(personId, (err, tasks) => {
      if (err) tasks = []
      peopleApi.getPersonDoneTasks(personId, (err, doneTasks) => {
        if (err) doneTasks = []
        commit(LOAD_PERSON_DONE_TASKS_END, doneTasks)
        peopleApi.getTimeSpents(personId, date, (err, timeSpents) => {
          if (err) timeSpents = []
          commit(PERSON_LOAD_TIME_SPENTS_END, timeSpents)
          commit(
            LOAD_PERSON_TASKS_END,
            { personId, tasks, userFilters, taskTypeMap }
          )
          if (callback) callback(err)
        })
      })
    })
  },

  loadAggregatedPersonTimeSpents (
    { commit, state, rootGetters }, {
      personId,
      detailLevel,
      year,
      month,
      week,
      day
    }) {
    return new Promise((resolve, reject) => {
      peopleApi.getAggregatedPersonTimeSpents(
        personId,
        detailLevel,
        year,
        month,
        week,
        day
      ).then((tasks) => {
        resolve(tasks)
      }).catch((err) => reject(err))
    })
  },

  showPersonImportModal ({ commit, state }, personId) {
    commit(SHOW_IMPORT_PEOPLE_MODAL)
  },

  hidePersonImportModal ({ commit, state }, personId) {
    commit(HIDE_IMPORT_PEOPLE_MODAL)
  },

  setPersonTasksSearch ({ commit, state }, searchText) {
    commit(SET_PERSON_TASKS_SEARCH, searchText)
  },

  savePersonTasksSearch ({ commit, rootGetters }, searchQuery) {
    return new Promise((resolve, reject) => {
      const query = state.personTaskSearchQueries.find(
        (query) => query.name === searchQuery
      )

      if (!query) {
        peopleApi.createFilter(
          'persontasks',
          searchQuery,
          searchQuery,
          null,
          null,
          (err, searchQuery) => {
            commit(SAVE_PERSON_TASKS_SEARCH_END, { searchQuery })
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

  removePersonTasksSearch ({ commit, rootGetters }, searchQuery) {
    return new Promise((resolve, reject) => {
      peopleApi.removeFilter(searchQuery, (err) => {
        commit(REMOVE_PERSON_TASKS_SEARCH_END, { searchQuery })
        if (err) reject(err)
        else resolve()
      })
    })
  },

  setTimeSpent ({ commit }, { personId, taskId, date, duration }) {
    return peopleApi.setTimeSpent(
      taskId,
      personId,
      date,
      duration
    ).then(timeSpent => {
      commit(SET_TIME_SPENT, timeSpent)
      Promise.resolve(timeSpent)
    })
  },

  setPersonTasksScrollPosition ({ commit }, scrollPosition) {
    commit(SET_PERSON_TASKS_SCROLL_POSITION, scrollPosition)
  },

  loadTimesheets ({ commit }, {
    detailLevel,
    year,
    month
  }) {
    return new Promise((resolve, reject) => {
      const monthString =
        month.length === 1 ? `0${parseInt(month) + 1}` : `${month}`
      let mainFunc = peopleApi.getMonthTable
      if (detailLevel === 'day') {
        mainFunc = peopleApi.getDayTable
      }
      if (detailLevel === 'week') {
        mainFunc = peopleApi.getWeekTable
      }
      if (detailLevel === 'year') {
        mainFunc = peopleApi.getYearTable
      }
      mainFunc(year, monthString)
        .then((table) => {
          commit(PEOPLE_TIMESHEET_LOADED, table)
          resolve()
        })
        .catch(reject)
    })
  },

  peopleSearchChange ({ commit }, text) {
    commit(PEOPLE_SEARCH_CHANGE, text)
  }
}

const mutations = {
  [LOAD_PEOPLE_START] (state) {
    state.isPeopleLoading = true
    state.isPeopleLoadingError = false
    state.personMap = {}
  },

  [LOAD_PEOPLE_ERROR] (state) {
    state.isPeopleLoading = false
    state.isPeopleLoadingError = true
  },

  [LOAD_PEOPLE_END] (state, people) {
    state.isPeopleLoading = false
    state.isPeopleLoadingError = false
    state.people = sortPeople(people)
    state.displayedPeople = state.people
    state.people.forEach((person) => {
      person = helpers.addAdditionalInformation(person)
      state.personMap[person.id] = person
    })
    state.peopleIndex = buildNameIndex(state.people)
  },

  [DELETE_PEOPLE_END] (state, person) {
    if (person) {
      const personToDeleteIndex = state.people.findIndex(
        (p) => p.id === person.id
      )
      if (personToDeleteIndex >= 0) {
        state.people.splice(personToDeleteIndex, 1)
      }
      delete state.personMap[person.id]
    }
    state.peopleIndex = buildNameIndex(state.people)
    if (state.peopleSearchText) {
      const keywords = getKeyWords(state.peopleSearchText)
      state.displayedPeople = indexSearch(state.peopleIndex, keywords)
    } else {
      state.displayedPeople = state.people
    }
  },

  [EDIT_PEOPLE_END] (state, form) {
    let personToAdd = { ...form }
    personToAdd = helpers.addAdditionalInformation(personToAdd)

    const personToEditIndex = state.people.findIndex(
      (person) => person.id === personToAdd.id
    )
    if (personToAdd.name) {
      if (personToEditIndex >= 0) {
        state.personMap[personToAdd.id] = personToAdd
        delete state.people[personToEditIndex]
        state.people[personToEditIndex] = state.personMap[personToAdd.id]
      } else if (!state.personMap[personToAdd.id]) {
        state.people.push(personToAdd)
        state.personMap[personToAdd.id] = personToAdd
      }
      state.people = sortPeople(state.people)
      state.peopleIndex = buildNameIndex(state.people)
      if (state.peopleSearchText) {
        const keywords = getKeyWords(state.peopleSearchText)
        state.displayedPeople = indexSearch(state.peopleIndex, keywords)
      } else {
        state.displayedPeople = state.people
      }
    }
  },

  [IMPORT_PEOPLE_START] (state, data) {
    state.isImportPeopleLoading = true
    state.isImportPeopleLoadingError = false
  },

  [IMPORT_PEOPLE_END] (state, personId) {
    state.isImportPeopleLoading = false
    state.isImportPeopleLoadingError = false
  },

  [IMPORT_PEOPLE_ERROR] (state) {
    state.isImportPeopleLoading = false
    state.isImportPeopleLoadingError = true
  },

  [SHOW_IMPORT_PEOPLE_MODAL] (state) {
    state.isImportPeopleModalShown = true
    state.isImportPeopleLoading = false
    state.isImportPeopleLoadingError = false
  },

  [HIDE_IMPORT_PEOPLE_MODAL] (state) {
    state.isImportPeopleModalShown = false
  },

  [PERSON_CSV_FILE_SELECTED] (state, formData) {
    state.personCsvFormData = formData
  },

  [UPLOAD_AVATAR_END] (state, personId) {
    const person = state.personMap[personId]
    if (person) {
      const randomHash = Math.random().toString(36).substring(7)
      person.has_avatar = true
      Vue.set(person, 'uniqueHash', randomHash)
      person.avatarPath =
        `/api/pictures/thumbnails/persons/${person.id}.png`
    }
  },

  [LOAD_PERSON_TASKS_END] (
    state,
    { personId, tasks, userFilters, taskTypeMap }
  ) {
    state.person = state.personMap[personId]

    tasks.forEach(populateTask)
    tasks.forEach((task) => {
      const taskStatus = helpers.getTaskStatus(task.task_status_id)
      task.taskStatus = taskStatus
    })
    const personTaskSelectionGrid = {}
    for (let i = 0; i < tasks.length; i++) {
      personTaskSelectionGrid[i] = { 0: false }
    }
    state.personTaskSelectionGrid = personTaskSelectionGrid
    state.personTasks = sortTasks(tasks, taskTypeMap)

    state.personTasksIndex = buildTaskIndex(tasks)
    const keywords = getKeyWords(state.personTasksSearchText)
    const searchResult = indexSearch(state.personTasksIndex, keywords)

    state.displayedPersonTasks = searchResult || state.personTasks
    if (userFilters.persontasks && userFilters.persontasks.all) {
      state.personTaskSearchQueries = userFilters.persontasks.all
    } else {
      state.personTaskSearchQueries = []
    }
  },

  [LOAD_PERSON_DONE_TASKS_END] (state, tasks) {
    tasks.forEach(populateTask)
    state.displayedPersonDoneTasks = tasks
  },

  [SET_PERSON_TASKS_SEARCH] (state, searchText) {
    state.displayedPersonTasks = []
    const keywords = getKeyWords(searchText)
    const searchResult = indexSearch(state.personTasksIndex, keywords)
    state.personTasksSearchText = searchText
    state.displayedPersonTasks = searchResult || state.personTasks
  },

  [SAVE_PERSON_TASKS_SEARCH_END] (state, { searchQuery }) {
    state.personTaskSearchQueries.push(searchQuery)
    state.personTaskSearchQueries = sortByName(state.personTaskSearchQueries)
  },

  [REMOVE_PERSON_TASKS_SEARCH_END] (state, { searchQuery }) {
    const queryIndex = state.personTaskSearchQueries.findIndex(
      (query) => query.name === searchQuery.name
    )
    if (queryIndex >= 0) {
      state.personTaskSearchQueries.splice(queryIndex, 1)
    }
  },

  [NEW_TASK_COMMENT_END] (state, { comment, taskId }) {
    const task = state.personTasks.find((task) => task.id === taskId)

    if (task) {
      const taskStatus = helpers.getTaskStatus(comment.task_status_id)

      Object.assign(task, {
        task_status_id: taskStatus.id,
        task_status_name: taskStatus.name,
        task_status_short_name: taskStatus.short_name,
        task_status_color: taskStatus.color
      })

      state.personTasksIndex = buildTaskIndex(state.personTasks)
    }
  },

  [REMOVE_SELECTED_TASK] (state, validationInfo) {
    if (state.personTaskSelectionGrid[validationInfo.x]) {
      state.personTaskSelectionGrid[validationInfo.x][0] = false
    }
  },

  [ADD_SELECTED_TASK] (state, validationInfo) {
    if (state.personTaskSelectionGrid[validationInfo.x]) {
      state.personTaskSelectionGrid[validationInfo.x][0] = true
    }
  },

  [CLEAR_SELECTED_TASKS] (state, validationInfo) {
    state.personTaskSelectionGrid = clearSelectionGrid(
      state.personTaskSelectionGrid
    )
  },

  [PEOPLE_TIMESHEET_LOADED] (state, timesheet) {
    state.timesheet = timesheet
  },

  [SET_TIME_SPENT] (state, timeSpent) {
    if (state.person.id === timeSpent.person_id) {
      state.personTimeSpentMap[timeSpent.task_id] = timeSpent
    }
    state.personTimeSpentTotal = Object
      .values(state.personTimeSpentMap)
      .reduce((acc, timeSpent) => timeSpent.duration + acc, 0) / 60
  },

  [PERSON_LOAD_TIME_SPENTS_END] (state, timeSpents) {
    const timeSpentMap = {}
    timeSpents.forEach((timeSpent) => {
      timeSpentMap[timeSpent.task_id] = timeSpent
    })
    state.personTimeSpentMap = timeSpentMap

    state.personTimeSpentTotal = Object
      .values(state.personTimeSpentMap)
      .reduce((acc, timeSpent) => timeSpent.duration + acc, 0) / 60
  },

  [SET_PERSON_TASKS_SCROLL_POSITION] (state, scrollPosition) {
    state.personTasksScrollPosition = scrollPosition
  },

  [PEOPLE_SEARCH_CHANGE] (state, text) {
    if (text) {
      const keywords = getKeyWords(text)
      state.displayedPeople = indexSearch(state.peopleIndex, keywords)
      state.peopleSearchText = text
    } else {
      state.displayedPeople = state.people
      state.peopleSearchText = ''
    }
  },

  [USER_SAVE_PROFILE_SUCCESS] (state, form) {
    const person = state.personMap[form.id]
    if (person) {
      Object.assign(person, form)
      helpers.addAdditionalInformation(person)
    }
  },

  [SET_ORGANISATION] (state, organisation) {
    Object.assign(state.organisation, organisation)
    state.organisation = { ...state.organisation }
  },

  [RESET_ALL] (state, people) {
    Object.assign(state, { ...initialState })
  }
}

export default {
  state,
  getters,
  actions,
  mutations,
  helpers
}
