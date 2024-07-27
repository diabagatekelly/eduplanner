import { mockBankLanguageVocabCardOral, mockBankLanguageVocabCardSpelling, mockLanguageActivity, mockUser, mockUserLanguageVocabCardOral, mockUserLanguageVocabCardSpelling } from "../../mocks";
import { createLanguageVocabCards } from '../../../api/controller';
import SubmitLanguageVocabCard from "../../../components/cards/submit-language-vocab-card";

jest.mock('../../../api/controller');

describe('Submit Language Vocab Card', () => {
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
  
  it('should invoke createLanguageVocabCards controller when form is submitted', async () => {
    const houseUserCards = [{...mockUserLanguageVocabCardOral, addedOn: null}, {...mockUserLanguageVocabCardSpelling, addedOn: null}]
    const catUserCards = [{...mockUserLanguageVocabCardOral, addedOn: null, cardId: `${btoa('arabic-vocab-cat-oral')}`}, {...mockUserLanguageVocabCardSpelling, addedOn: null, cardId: `${btoa('arabic-vocab-cat-spelling')}`}]
    const houseBankCards = [{...mockBankLanguageVocabCardOral}, {...mockBankLanguageVocabCardSpelling}]
    const catBankCards = [{...mockBankLanguageVocabCardOral, cardId: `${btoa('arabic-vocab-cat-oral')}`, word: 'cat'}, {...mockBankLanguageVocabCardSpelling, cardId: `${btoa('arabic-vocab-cat-spelling')}`, word: 'cat'}]

    const expectedReturnedCards = [...houseUserCards, ...catUserCards]
    const expectedMethodPaylod = {
      userId: `${btoa('mock.user@email.com')}`,
      activity: 'Arabic-Language',
      vocabList: ['house', 'cat']
    };
    const expectedControllerPayload = {
      userId: expectedMethodPaylod.userId,
      activity: 'Arabic-Language',
      cards: {
        userCards: [...houseUserCards, ...catUserCards], 
        bankCards: [...houseBankCards, ...catBankCards]
      }
    };

    (createLanguageVocabCards as jest.Mock).mockImplementationOnce(() => {
      return Promise.resolve({status: 200, data: {message: 'Cards added', details: expectedReturnedCards}})
    });

    await SubmitLanguageVocabCard(expectedMethodPaylod)

    expect(createLanguageVocabCards).toHaveBeenCalledWith(expectedControllerPayload)
  })
})