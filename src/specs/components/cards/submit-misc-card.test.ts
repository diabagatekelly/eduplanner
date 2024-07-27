import { mockBankLanguageVocabCardOral, mockBankLanguageVocabCardSpelling, mockLanguageActivity, mockUser, mockUserLanguageVocabCardOral, mockUserLanguageVocabCardSpelling } from "../../mocks";
import { createCards } from '../../../api/controller';
import SubmitMiscCard from "../../../components/cards/submit-misc-card";

jest.mock('../../../api/controller');

describe('Submit Language Grammar Card', () => {
  const user = {...mockUser, activities: [{...mockLanguageActivity}]}
  
  beforeEach(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2/4/2024'))
    window.sessionStorage.setItem('user_data', JSON.stringify(user))
    window.sessionStorage.setItem('user_token', 'xxxxxx')
    window.sessionStorage.setItem('created_on', '2/3/2024')
  })

  afterEach(() => {
    jest.resetAllMocks();
    jest.clearAllMocks()
    window.sessionStorage.clear()
    jest.useRealTimers()
  })
  
  it('should invoke createCards controller when form is submitted', async () => {
    const houseUserCards = [{...mockUserLanguageVocabCardOral, addedOn: null, cardId: `${btoa('arabic-grammar-house')}`, activityType: 'Grammar'}]
    const catUserCards = [{...mockUserLanguageVocabCardOral, addedOn: null, cardId: `${btoa('arabic-grammar-cat')}`, activityType: 'Grammar'}]

    const expectedReturnedCards = [...houseUserCards, ...catUserCards]
    const expectedMethodPaylod = {
      userId: `${btoa('mock.user@email.com')}`,
      activity: 'Arabic-Language',
      miscList: ['house', 'cat'],
      type: 'Grammar'
    };
    const expectedControllerPayload = {
      userId: expectedMethodPaylod.userId,
      activity: 'Arabic-Language',
      cards: [...houseUserCards, ...catUserCards]
    };

    (createCards as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: 'Cards added', details: expectedReturnedCards}})
    });

    await SubmitMiscCard(expectedMethodPaylod)

    expect(createCards).toHaveBeenCalledWith(expectedControllerPayload)
  })
})
