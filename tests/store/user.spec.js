import { expect } from 'chai'
import helpers from './helpers'
import peopleApi from '../../src/store/api/people'
import store from '../../src/store'
import {
  USER_LOGIN,
  USER_LOGOUT,
  USER_LOGIN_FAIL,

  USER_SAVE_PROFILE_LOADING,
  USER_SAVE_PROFILE_SUCCESS,
  USER_SAVE_PROFILE_ERROR,

  USER_CHANGE_PASSWORD_LOADING,
  USER_CHANGE_PASSWORD_SUCCESS,
  USER_CHANGE_PASSWORD_ERROR,
  USER_CHANGE_PASSWORD_UNVALID,

  USER_LOAD_TODOS_END,
  USER_LOAD_DONE_TASKS_END,

  LOAD_USER_FILTERS_END,

  LOAD_TASK_TYPES_END,

  SET_TODOS_SEARCH
} from '../../src/store/mutation-types'

const user = {
  first_name: 'John',
  last_name: 'Doe',
  email: 'john@doe.fr'
}
let tasks = null
let doneTasks = []
let userFilters = {}

const taskTypeMap = {
<<<<<<< HEAD
  'task-type-1': {id: 'task-type-1', priority: 1, name: 'Modeling'},
  'task-type-2': {id: 'task-type-2', priority: 1, name: 'Setup'},
  'task-type-3': {id: 'task-type-3', priority: 2, name: 'Texture'}
=======
  'task-type-1': { id: 'task-type-1', priority: 1, name: 'Modeling' },
  'task-type-2': { id: 'task-type-2', priority: 1, name: 'Setup' },
  'task-type-3': { id: 'task-type-3', priority: 2, name: 'Texture' }
>>>>>>> 1de73864 (Add electron)
}

peopleApi.updatePerson = (form, callback) => {
  if (form === undefined) {
    return process.nextTick(() => callback(new Error('Server error')))
  } else {
    return process.nextTick(callback)
  }
}

peopleApi.changePassword = (form, callback) => {
  if (form.old_password === 'wrongPassword') {
    return process.nextTick(() => callback(new Error('Wrong password')))
  } else {
    return process.nextTick(callback)
  }
}

peopleApi.loadTodos = (callback) => {
  return process.nextTick(() => callback(null, tasks))
}

peopleApi.loadDone = (callback) => {
  return process.nextTick(() => callback(null, doneTasks))
}

peopleApi.getUserSearchFilters = (callback) => {
  return process.nextTick(() => callback(null, userFilters))
}

peopleApi.loadTimeSpents = (data, callback) => {
  process.nextTick(() => {
    callback(null, [])
  })
}

describe('user', () => {
<<<<<<< HEAD

=======
>>>>>>> 1de73864 (Add electron)
  beforeEach(helpers.reset)
  afterEach(helpers.reset)

  beforeEach(() => {
    tasks = [
      {
        project_name: 'Agent327',
        task_type_name: 'Modeling',
        entity_name: 'Tree',
        entity_type_name: 'Props',
        entity_id: 'asset-1',
        task_status_short_name: 'wip',
        task_type_id: 'task-type-1',
        last_comment: {},
        id: 'task-1'
      },
      {
        project_name: 'Agent327',
        task_type_name: 'Setup',
        entity_name: 'Tree',
        entity_type_name: 'Props',
        entity_id: 'asset-1',
        task_status_short_name: 'todo',
        task_type_id: 'task-type-1',
        last_comment: {
<<<<<<< HEAD
          text: "last comment",
          person_id: "person-1"
=======
          text: 'last comment',
          person_id: 'person-1'
>>>>>>> 1de73864 (Add electron)
        },
        id: 'task-2'
      }
    ]

    doneTasks = [{
      project_name: 'Agent327',
      task_type_name: 'Concept',
      entity_name: 'Tree',
      entity_type_name: 'Props',
      entity_id: 'asset-1',
      task_status_short_name: 'done',
      task_type_id: 'task-type-1',
      last_comment: {},
      id: 'task-1'
    }]

    userFilters = {
      asset: {
        'prod-1': [{
          name: 'props',
          query: 'props',
          id: 'filter-1'
        }]
      }
    }
  })

  describe('actions', () => {
    it('saveProfile', (done) => {
      store.commit(USER_LOGIN, user)
      helpers.runAction('saveProfile', {
        form: {
          phone: '01 02 03 04'
        },
        callback: () => {
          expect(store._vm.isSaveProfileLoading).to.not.be.ok
          expect(store._vm.isSaveProfileLoadingError).to.not.be.ok
<<<<<<< HEAD
          expect(store._vm.user.phone).to.equal("01 02 03 04")
=======
          expect(store._vm.user.phone).to.equal('01 02 03 04')
>>>>>>> 1de73864 (Add electron)
          done()
        }
      })
      expect(store._vm.isSaveProfileLoading).to.be.ok
      expect(store._vm.isSaveProfileLoadingError).to.not.be.ok
    })

    it('saveProfile (fail)', (done) => {
      store.commit(USER_LOGIN, user)
      helpers.runAction('saveProfile', {
        callback: () => {
          expect(store._vm.isSaveProfileLoading).to.not.be.ok
          expect(store._vm.isSaveProfileLoadingError).to.be.ok
          done()
        }
      })
      expect(store._vm.isSaveProfileLoading).to.be.ok
      expect(store._vm.isSaveProfileLoadingError).to.not.be.ok
    })

<<<<<<< HEAD

=======
>>>>>>> 1de73864 (Add electron)
    it('checkPasswordValidityAndSave (password unvalid)', (done) => {
      helpers.runAction('checkNewPasswordValidityAndSave', {
        form: {
          old_password: 'oldPassword',
          password: 'newPassword',
          password2: 'newPasswordd'
        },
        callback: done
      })
      expect(store._vm.changePassword.isLoading).to.not.be.ok
      expect(store._vm.changePassword.isValid).to.not.be.ok
    })

    it('checkPasswordValidityAndSave (password valid)', (done) => {
      helpers.runAction('checkNewPasswordValidityAndSave', {
        form: {
          old_password: 'oldPassword',
          password: 'newPassword',
          password2: 'newPassword'
        },
        callback: () => {
          expect(store._vm.changePassword.isLoading).to.not.be.ok
          expect(store._vm.changePassword.isSuccess).to.be.ok
          expect(store._vm.changePassword.isValid).to.be.ok
          done()
        }
      })
      expect(store._vm.changePassword.isLoading).to.be.ok
      expect(store._vm.changePassword.isValid).to.be.ok
    })

    it('changeUserPassword', (done) => {
      helpers.runAction('changeUserPassword', {
        form: {
          old_password: 'oldPassword',
          password: 'newPassword',
          password_2: 'newPassword'
        },
        callback: () => {
          expect(store._vm.changePassword.isLoading).to.not.be.ok
          expect(store._vm.changePassword.isError).to.not.be.ok
          expect(store._vm.changePassword.isSuccess).to.be.ok
          expect(store._vm.changePassword.isValid).to.be.ok
          done()
        }
      })
      expect(store._vm.changePassword.isLoading).to.be.ok
      expect(store._vm.changePassword.isError).to.not.be.ok
      expect(store._vm.changePassword.isSuccess).to.not.be.ok
      expect(store._vm.changePassword.isValid).to.be.ok
    })

    it('changeUserPassword (fail)', (done) => {
      helpers.runAction('changeUserPassword', {
        form: {
          old_password: 'wrongPassword',
          password: 'newPassword',
          password_2: 'newPassword'
        },
        callback: () => {
          expect(store._vm.changePassword.isLoading).to.not.be.ok
          expect(store._vm.changePassword.isError).to.be.ok
          expect(store._vm.changePassword.isSuccess).to.not.be.ok
          expect(store._vm.changePassword.isValid).to.be.ok
          done()
        }
      })
      expect(store._vm.changePassword.isLoading).to.be.ok
      expect(store._vm.changePassword.isError).to.not.be.ok
      expect(store._vm.changePassword.isSuccess).to.not.be.ok
      expect(store._vm.changePassword.isValid).to.be.ok
    })

    it('loadTodos', (done) => {
      store.commit(LOAD_TASK_TYPES_END, Object.values(taskTypeMap))
      helpers.runAction('loadTodos', {
        personId: 'person-1',
        callback: (err) => {
          expect(store._vm.displayedTodos).to.deep.equal(tasks)
          expect(
            store._vm.displayedTodos[0].full_entity_name
          ).to.equal('Props / Tree')
          expect(store._vm.displayedDoneTasks).to.deep.equal(doneTasks)
          done()
        }
      })
    })

    it('setTodosSearch', () => {
      store.commit(USER_LOAD_TODOS_END, { tasks, userFilters, taskTypeMap })
      helpers.runAction('setTodosSearch', 'wip')

      expect(store._vm.todosSearchText).to.equal('wip')
      expect(store._vm.displayedTodos[0]).to.deep.equal(tasks[0])
      expect(store._vm.displayedTodos.length).to.equal(1)

      helpers.runAction('setTodosSearch', '')
    })

    it('loadUserSearchFilters', () => {
      helpers.runAction('loadUserSearchFilters', () => {
        const filterId = store._vm.userFilters.asset['prod-1'][0].id
        expect(filterId).to.equal('filter-1')
      })
    })
  })

  describe('mutations', () => {
    it('USER_LOGIN', () => {
      store.commit(USER_LOGIN, user)
      expect(store._vm.user.first_name).to.equal('John')
      expect(store._vm.isAuthenticated).to.be.ok
    })
    it('USER_LOGOUT', () => {
      store.commit(USER_LOGOUT)
      expect(store._vm.user).to.be.null
      expect(store._vm.isAuthenticated).to.not.be.ok
    })
    it('USER_LOGIN_FAIL', () => {
      store.commit(USER_LOGIN_FAIL)
      expect(store._vm.user).to.be.null
      expect(store._vm.isAuthenticated).to.not.be.ok
    })

    it('USER_SAVE_PROFILE_LOADING', () => {
      store.commit(USER_SAVE_PROFILE_LOADING)
      expect(store._vm.isSaveProfileLoading).to.be.ok
      expect(store._vm.isSaveProfileLoadingError).to.not.be.ok
    })
    it('USER_SAVE_PROFILE_ERROR', () => {
      store.commit(USER_SAVE_PROFILE_ERROR)
      expect(store._vm.isSaveProfileLoading).to.not.be.ok
      expect(store._vm.isSaveProfileLoadingError).to.be.ok
    })
    it('USER_SAVE_PROFILE_SUCCESS', () => {
      store.commit(USER_LOGIN, user)
<<<<<<< HEAD
      store.commit(USER_SAVE_PROFILE_SUCCESS, {phone: "01 02 03 04"})
      expect(store._vm.isSaveProfileLoading).to.not.be.ok
      expect(store._vm.isSaveProfileLoadingError).to.not.be.ok
      expect(store._vm.user.phone).to.equal("01 02 03 04")
=======
      store.commit(USER_SAVE_PROFILE_SUCCESS, { phone: '01 02 03 04' })
      expect(store._vm.isSaveProfileLoading).to.not.be.ok
      expect(store._vm.isSaveProfileLoadingError).to.not.be.ok
      expect(store._vm.user.phone).to.equal('01 02 03 04')
>>>>>>> 1de73864 (Add electron)
    })

    it('USER_CHANGE_PASSWORD_LOADING', () => {
      store.commit(USER_CHANGE_PASSWORD_LOADING)
      expect(store._vm.changePassword.isLoading).to.be.ok
      expect(store._vm.changePassword.isError).to.not.be.ok
      expect(store._vm.changePassword.isSuccess).to.not.be.ok
      expect(store._vm.changePassword.isValid).to.be.ok
    })
    it('USER_CHANGE_PASSWORD_ERROR', () => {
      store.commit(USER_CHANGE_PASSWORD_ERROR)
      expect(store._vm.changePassword.isLoading).to.not.be.ok
      expect(store._vm.changePassword.isError).to.be.ok
      expect(store._vm.changePassword.isSuccess).to.not.be.ok
      expect(store._vm.changePassword.isValid).to.be.ok
    })
    it('USER_CHANGE_PASSWORD_SUCCESS', () => {
      store.commit(USER_CHANGE_PASSWORD_SUCCESS)
      expect(store._vm.changePassword.isLoading).to.not.be.ok
      expect(store._vm.changePassword.isError).to.not.be.ok
      expect(store._vm.changePassword.isSuccess).to.be.ok
      expect(store._vm.changePassword.isValid).to.be.ok
    })
    it('USER_CHANGE_PASSWORD_UNVALID', () => {
      store.commit(USER_CHANGE_PASSWORD_UNVALID)
      expect(store._vm.changePassword.isLoading).to.not.be.ok
      expect(store._vm.changePassword.isError).to.not.be.ok
      expect(store._vm.changePassword.isSuccess).to.not.be.ok
      expect(store._vm.changePassword.isValid).to.not.be.ok
    })

    it('USER_LOAD_TODOS_END', () => {
      store.commit(USER_LOAD_TODOS_END, {
        tasks,
        userFilters,
        taskTypeMap
      })
      expect(store._vm.displayedTodos).to.deep.equal(tasks)
      expect(
        store._vm.displayedTodos[0].full_entity_name
      ).to.equal('Props / Tree')
    })

    it('USER_LOAD_DONE_TASKS_END', () => {
      store.commit(USER_LOAD_DONE_TASKS_END, doneTasks)
      expect(store._vm.displayedDoneTasks).to.deep.equal(doneTasks)
    })

    it('SET_TODOS_SEARCH', () => {
      store.commit(USER_LOAD_TODOS_END, { tasks, userFilters, taskTypeMap })
      store.commit(SET_TODOS_SEARCH, 'wip')

      expect(store._vm.todosSearchText).to.equal('wip')
      expect(store._vm.displayedTodos[0]).to.deep.equal(tasks[0])
      expect(store._vm.displayedTodos.length).to.equal(1)
    })

    it('LOAD_USER_FILTERS_END', () => {
      store.commit(LOAD_USER_FILTERS_END, userFilters)
      expect(store._vm.userFilters.asset['prod-1'][0].id).to.equal('filter-1')
    })
  })
})
