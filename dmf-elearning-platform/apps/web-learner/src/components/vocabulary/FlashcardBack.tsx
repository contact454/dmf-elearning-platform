export function FlashcardBack({ 
  translation, 
  exampleSentence, 
  exampleTranslation 
}: {
  translation: string
  exampleSentence?: string
  exampleTranslation?: string
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-xl border-2 border-blue-200">
      {/* Vietnamese Translation */}
      <h2 className="text-5xl font-bold text-blue-900 mb-6 text-center">
        {translation}
      </h2>
      
      {/* Example Sentence */}
      {exampleSentence && (
        <div className="mt-8 max-w-md text-center">
          <p className="text-gray-700 italic mb-2">
            "{exampleSentence}"
          </p>
          {exampleTranslation && (
            <p className="text-gray-600 text-sm">
              {exampleTranslation}
            </p>
          )}
        </div>
      )}
      
      <p className="mt-8 text-gray-500 text-sm">
        Click để trở về
      </p>
    </div>
  )
}
