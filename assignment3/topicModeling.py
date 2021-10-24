# Source: https://www.analyticsvidhya.com/blog/2016/08/beginners-guide-to-topic-modeling-in-python/#h2_9 
# Beginners Guide to Topic Modeling in Python, Shivam Bansal, posted August 24, 2016, visited October 16, 2021

import os
from nltk import probability
from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer
import string
import gensim
from gensim import corpora
import json

source_folder = "data/split_fairytales/"
all_files = os.listdir(source_folder)
all_documents = []

for file_name in all_files:
    with open(source_folder + file_name, "r") as file:
        text = file.read()
        split = text.partition("\n")
        story = split[2]
        all_documents.append(story)

# at this point, all stories will be in the all_documents array


def clean(doc):
    stop = set(stopwords.words('english'))
    exclude = set(string.punctuation)
    lemma = WordNetLemmatizer()
    fillerWords = ["said", "says", "one", "could", "come", "came", "would", "made", "quite", "stood", "like", "looked", "know", "get", "still", "back", "thought", "time", "upon", "day", "well", "‘i", "great", "good", "see", "go", "saw", "took", "take", "went", "must", "away", "shall", "man", "little", "old"]
    for word in fillerWords:
        stop.add(word)
    
    punc_free = ''.join([ch for ch in doc.lower() if ch not in exclude])
    stop_free = " ".join([i for i in punc_free.split() if i not in stop])
    normalized = " ".join(lemma.lemmatize(word) for word in stop_free.split())
    return normalized

doc_clean = [clean(doc).split() for doc in all_documents]   
dictionary = corpora.Dictionary(doc_clean)

# Converting list of documents (corpus) into Document Term Matrix using dictionary prepared above.
doc_term_matrix = [dictionary.doc2bow(doc) for doc in doc_clean]

# Creating the object for LDA model using gensim libraryznk 
Lda = gensim.models.ldamodel.LdaModel

# Running and Training LDA model on the document term matrix.
num_topics = 5
ldamodel = Lda(doc_term_matrix, num_topics=num_topics, id2word = dictionary, passes=50)

print(ldamodel.print_topics(num_topics=num_topics, num_words=8))

#Source: https://stackoverflow.com/questions/61198009/classify-text-with-gensim-lda-model
# Classify Text with Gensim LDA Model, StackOverflow, posted April, 2020, visited October 17, 2021
story_source_folder = "data/full_stories/"
classification_files = os.listdir(story_source_folder)
stories = []
titles = []

for file_name in classification_files:
    with open(story_source_folder + file_name, "r") as file:
        text = file.read()
        split = text.partition("\n")
        story = split[2]
        stories.append(story)
        title = split[0]
        titles.append(title)


probabilities = []
for index, story in enumerate(stories): 
    exclude = set(string.punctuation)
    story = "".join([ch for ch in story.lower() if ch not in exclude])
    story = story.split()
    story_bow = dictionary.doc2bow(story)
    doc_lda = ldamodel[story_bow]
    key = lambda x : x[1]
    print(titles[index] + ' assigned to Topic ' + str(max(doc_lda, key = key)[0]) + ' with ' + str(round(max(doc_lda, key = key)[1]*100,2)) + ' probability')
    print(doc_lda)
    probs = []
    j = 0
    for i in range(0, num_topics):
        if j < len(doc_lda) and doc_lda[j][0] == i:
            # required to convert to str for writing output
            probs.append(str(doc_lda[j][1]))
            j = j+1
        else:
            probs.append("0")
    probabilities.append(probs)


joined_probabilities = []
for i in range(0, len(probabilities)):
    joined_probabilities.append({
        "title": titles[i],
        "probabilities": probabilities[i]
    })

topics = ldamodel.show_topics()
joined = {
    "topics": str(topics),
    "storydata": joined_probabilities
}

output_directory = "data/"
output_filename = "output.json"
with open(output_directory + output_filename, "w") as out:
    out.write(json.dumps(joined, indent=4))