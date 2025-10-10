export type Question = {
    question: string;
    options: string[];
    correctAnswer: string;
};

type DifficultyLevel = {
    easy: Question[];
    medium: Question[];
    xone: Question[];
};

type QuizData = {
    [topic: string]: DifficultyLevel;
};

export const quizData: QuizData = {
    "XML": {
        easy: [
            { question: "What does XML stand for?", options: ["Extra Modern Language", "Extensible Markup Language", "Example Markup Language", "Extended Machine Language"], correctAnswer: "Extensible Markup Language" },
            { question: "All XML elements must have a closing tag.", options: ["True", "False"], correctAnswer: "True" },
            { question: "What is the correct syntax for an XML comment?", options: ["<!-- This is a comment -->", "// This is a comment", "/* This is a comment */", "<comment>This is a comment</comment>"], correctAnswer: "<!-- This is a comment -->" },
            { question: "What characters are used to define the beginning and end of tags?", options: ["()", "[]", "{}", "<>"], correctAnswer: "<>" },
            { question: "Which of these is a well-formed XML element?", options: ["<price>9.99</price>", "<price>9.99<price>", "<price>9.99", "</price>"], correctAnswer: "<price>9.99</price>" },
            { question: "Every XML document must have a single _______ element.", options: ["root", "base", "start", "main"], correctAnswer: "root" },
            { question: "Are XML tags case-sensitive?", options: ["Yes", "No"], correctAnswer: "Yes" },
            { question: "What is the term for info attached to an element, like `<book lang=\"en\">`?", options: ["Attribute", "Property", "Tag", "Metadata"], correctAnswer: "Attribute" },
            { question: "In the context of LLMs, XML is often used for...", options: ["Styling web pages", "Database queries", "Structured data input/output", "Creating animations"], correctAnswer: "Structured data input/output" },
            { question: "What is a 'prolog' in an XML document?", options: ["The main content", "The final closing tag", "The declaration at the start, e.g., <?xml version=\"1.0\"?>", "A list of comments"], correctAnswer: "The declaration at the start, e.g., <?xml version=\"1.0\"?>" },
        ],
        medium: [
            { question: "What is the purpose of a DTD (Document Type Definition) in XML?", options: ["To style the XML content", "To define the structure of an XML document", "To add comments to XML", "To execute scripts"], correctAnswer: "To define the structure of an XML document" },
            { question: "When prompting an LLM, why might you wrap instructions in `<instructions>` tags?", options: ["It's required by XML syntax", "To make the text bold", "To clearly separate instructions from data", "To hide the instructions"], correctAnswer: "To clearly separate instructions from data" },
            { question: "What's the difference between a well-formed and a valid XML document?", options: ["There is no difference", "Well-formed has comments, valid does not", "Well-formed follows syntax rules, valid also follows a DTD/Schema", "Valid XML is always shorter"], correctAnswer: "Well-formed follows syntax rules, valid also follows a DTD/Schema" },
            { question: "How do you represent special characters like `<` in XML element content?", options: ["By using single quotes", "Using character entities, e.g., &lt;", "By escaping with a backslash \\<", "You can't use them"], correctAnswer: "Using character entities, e.g., &lt;" },
            { question: "To ask an LLM to generate a list of items in XML, what's most important to specify?", options: ["The font size", "The root element and the repeating child element names", "The color of the tags", "The number of attributes"], correctAnswer: "The root element and the repeating child element names" },
            { question: "What does CDATA stand for?", options: ["Cascading Data", "Character Data", "Coded Data", "Compressed Data"], correctAnswer: "Character Data" },
            { question: "Why use a CDATA section in an XML prompt for an LLM?", options: ["To include text with special characters without parsing", "To encrypt the data", "To make the text larger", "To link to an external file"], correctAnswer: "To include text with special characters without parsing" },
            { question: "Providing an example of the desired XML output in a prompt is called...", options: ["Zero-shot prompting", "Negative prompting", "Few-shot prompting", "Instructional prompting"], correctAnswer: "Few-shot prompting" },
            { question: "What is an XML namespace used for?", options: ["To define the space between elements", "To avoid naming conflicts in elements", "To specify the programming language", "To set the document width"], correctAnswer: "To avoid naming conflicts in elements" },
            { question: "Which is NOT a valid XML element name?", options: ["<element_1>", "<_element>", "<element>", "<1st_element>"], correctAnswer: "<1st_element>" },
        ],
        xone: [
            { question: "When asking an LLM to act as a character, what is this prompt technique called?", options: ["Persona or Role-playing prompt", "System prompt", "Temperature prompt", "Token prompt"], correctAnswer: "Persona or Role-playing prompt" },
            { question: "You need an LLM to generate complex, nested XML. What is the best approach?", options: ["Use very short prompts", "Provide a detailed XML schema or a clear few-shot example", "Ask the LLM to invent its own structure", "Increase the temperature setting to maximum"], correctAnswer: "Provide a detailed XML schema or a clear few-shot example" },
            { question: "What is 'Chain of Thought' prompting?", options: ["Linking multiple prompts together", "Guiding an LLM to reason step-by-step before answering", "A prompt that only contains a chain of keywords", "Asking the LLM to think about philosophy"], correctAnswer: "Guiding an LLM to reason step-by-step before answering" },
            { question: "What's a downside of using verbose XML tags in a prompt for a token-limited LLM?", options: ["It confuses the LLM", "It makes the XML invalid", "It consumes more tokens from the context window", "It slows down the internet connection"], correctAnswer: "It consumes more tokens from the context window" },
            { question: "To ensure an LLM's XML output adheres to a strict format, what's most effective?", options: ["Asking it nicely", "Providing a schema and asking it to act as a validator", "Using all capital letters in the prompt", "Keeping the prompt to a single sentence"], correctAnswer: "Providing a schema and asking it to act as a validator" },
            { question: "What is the general best practice for attributes vs. child elements?", options: ["Use attributes for all data", "Use elements for all data", "Attributes are for metadata, elements are for content data", "Attributes are for numbers, elements are for text"], correctAnswer: "Attributes are for metadata, elements are for content data" },
            { question: "What is XSLT used for in relation to XML?", options: ["To query XML data", "To validate XML structure", "To transform XML documents into other formats like HTML", "To style XML like CSS"], correctAnswer: "To transform XML documents into other formats like HTML" },
            { question: "In a 'zero-shot' prompt, you ask an LLM to generate XML...", options: ["...using only one example", "...using zero tags", "...without providing any examples of the output format", "...with a temperature of zero"], correctAnswer: "...without providing any examples of the output format" },
            { question: "To constrain an LLM to only use specific XML tags, you should...", options: ["Hope for the best", "Provide the list of tags as a comma-separated string", "Explicitly list the allowed tags and their hierarchy in the instructions", "Write the forbidden tags in a comment"], correctAnswer: "Explicitly list the allowed tags and their hierarchy in the instructions" },
            { question: "What's a key advantage of using XML for prompts over plain text?", options: ["It's always shorter", "It allows for colors", "Enforces a clear, hierarchical structure for complex instructions", "It requires less memory"], correctAnswer: "Enforces a clear, hierarchical structure for complex instructions" },
        ],
    },
    "JSON": {
        easy: [
            { question: "What does JSON stand for?", options: ["Java Standard Object Notation", "JavaScript Object Notation", "JavaScript Standard Object Notation", "Java Simple Object Notation"], correctAnswer: "JavaScript Object Notation" },
            { question: "What characters enclose a JSON object?", options: ["()", "[]", "{}", "<>"], correctAnswer: "{}" },
            { question: "What characters enclose a JSON array?", options: ["()", "[]", "{}", "<>"], correctAnswer: "[]" },
            { question: "In JSON, keys must be strings enclosed in...", options: ["Single quotes", "Double quotes", "Backticks", "No quotes"], correctAnswer: "Double quotes" },
            { question: "Which is NOT a valid JSON data type?", options: ["string", "number", "boolean", "function"], correctAnswer: "function" },
            { question: "Is a trailing comma allowed in JSON objects or arrays?", options: ["Yes", "No", "Only in arrays", "Only in objects"], correctAnswer: "No" },
            { question: "What separates key-value pairs in a JSON object?", options: ["A semicolon ;", "A colon :", "A comma ,", "A space"], correctAnswer: "A comma ," },
            { question: "What separates a key from its value?", options: ["An equals sign =", "A colon :", "An arrow ->", "A space"], correctAnswer: "A colon :" },
            { question: "JSON is often described as a _______ format for data.", options: ["Heavyweight", "Lightweight", "Complex", "Proprietary"], correctAnswer: "Lightweight" },
            { question: "For an LLM, JSON is a common format for specifying...", options: ["The user's mood", "The desired output structure", "The color scheme", "The font size"], correctAnswer: "The desired output structure" },
        ],
        medium: [
            { question: "How do you represent a nested object in JSON?", options: ["A value of a key can be another JSON object {}", "By using the 'nest' keyword", "By using parentheses", "It's not possible"], correctAnswer: "A value of a key can be another JSON object {}" },
            { question: "What's the main advantage of JSON over XML for web APIs?", options: ["It's more secure", "It supports more data types", "It's less verbose and easier to parse in JavaScript", "It's older and more established"], correctAnswer: "It's less verbose and easier to parse in JavaScript" },
            { question: "When prompting an LLM to produce JSON, what's a critical instruction?", options: ["To make it colorful", "To ensure the output is valid, parseable JSON", "To add lots of comments", "To use single quotes"], correctAnswer: "To ensure the output is valid, parseable JSON" },
            { question: "Providing an example of a desired JSON structure in a prompt is an example of what?", options: ["Negative prompting", "Few-shot prompting", "Random prompting", "Zero-shot prompting"], correctAnswer: "Few-shot prompting" },
            { question: "How would you instruct an LLM to generate a list of users?", options: ["Specify an array of objects with user keys", "Tell it to 'think about users'", "Ask for a string of names", "Provide an image of a user list"], correctAnswer: "Specify an array of objects with user keys" },
            { question: "What does it mean to 'serialize' data into JSON?", options: ["To encrypt the data", "To convert a data structure into a JSON string", "To delete the data", "To sort the data alphabetically"], correctAnswer: "To convert a data structure into a JSON string" },
            { question: "What's a common error an LLM might make when generating JSON?", options: ["Making the JSON too short", "Using the wrong colors", "Forgetting quotes around keys or adding a trailing comma", "Using too many numbers"], correctAnswer: "Forgetting quotes around keys or adding a trailing comma" },
            { question: "What is a 'zero-shot' prompt for JSON generation?", options: ["Asking the LLM to create JSON without providing an example", "A prompt that costs zero dollars", "A prompt that expects no output", "A prompt with zero characters"], correctAnswer: "Asking the LLM to create JSON without providing an example" },
            { question: "Why is JSON's strict syntax useful when working with LLMs?", options: ["It makes the prompt harder to write", "It results in predictable, machine-readable output", "It allows for more creativity", "It limits the length of the output"], correctAnswer: "It results in predictable, machine-readable output" },
            { question: "Can a JSON value be `null`?", options: ["Yes", "No", "Only for numbers", "Only for strings"], correctAnswer: "Yes" },
        ],
        xone: [
            { question: "What is JSON Schema?", options: ["A theme for JSON", "A JavaScript library", "A vocabulary that allows you to annotate and validate JSON documents", "A database for storing JSON"], correctAnswer: "A vocabulary that allows you to annotate and validate JSON documents" },
            { question: "How could you use JSON Schema in a prompt for an LLM?", options: ["You can't use it in a prompt", "Provide the schema to define the exact structure of the required JSON output", "As an example of what not to do", "To confuse the LLM"], correctAnswer: "Provide the schema to define the exact structure of the required JSON output" },
            { question: "You ask an LLM for a list, but it returns a single object. How can you fix this in the prompt?", options: ["Shout at the LLM", "Clarifying that the root should be an array []", "Ask for an XML instead", "Add more adjectives to the prompt"], correctAnswer: "Clarifying that the root should be an array []" },
            { question: "What's a potential issue with asking an LLM to generate very deeply nested JSON?", options: ["The internet can't handle it", "Increased chance of syntax errors and hallucination", "It will be too easy to read", "The file size will be too small"], correctAnswer: "Increased chance of syntax errors and hallucination" },
            { question: "In a 'Chain of Thought' prompt for generating JSON, you might ask the LLM to first...", options: ["Write a poem", "Plan the data structure before writing the JSON", "Generate a random number", "Output the JSON immediately"], correctAnswer: "Plan the data structure before writing the JSON" },
            { question: "To get an LLM to act as an API endpoint that returns JSON, you would use what kind of prompt?", options: ["A very short prompt", "A role-playing or persona prompt", "A negative prompt", "A prompt in all caps"], correctAnswer: "A role-playing or persona prompt" },
            { question: "What's the benefit of requesting a JSON object with a specific `\"status\": \"success\"` key from an LLM?", options: ["It makes the output harder to read", "It makes the output easier to parse and handle programmatically", "It adds a nice color", "It's required for all JSON"], correctAnswer: "It makes the output easier to parse and handle programmatically" },
            { question: "What's the difference between `JSON.parse()` and `JSON.stringify()`?", options: ["They are the same", "`parse` is string to object, `stringify` is object to string", "`parse` is for numbers, `stringify` is for strings", "`parse` encrypts, `stringify` decrypts"], correctAnswer: "`parse` is string to object, `stringify` is object to string" },
            { question: "Why might an LLM 'hallucinate' keys or values not requested in the prompt?", options: ["It has a creative imagination", "The model is generating statistically likely text, not executing code", "It's a bug in the LLM", "It's trying to be helpful"], correctAnswer: "The model is generating statistically likely text, not executing code" },
            { question: "How would you prompt an LLM to create a JSON object where keys are dynamic (e.g., user IDs)?", options: ["You can't, keys must be static", "Tell it to 'be creative with keys'", "Describe the pattern for the keys and provide an example", "Ask it to use random numbers as keys"], correctAnswer: "Describe the pattern for the keys and provide an example" },
        ],
    },
    "YAML": {
        easy: [
            { question: "What is a primary design goal of YAML?", options: ["Machine-to-machine communication", "Strict data typing", "Human readability", "Browser compatibility"], correctAnswer: "Human readability" },
            { question: "What does YAML stand for?", options: ["Yet Another Markup Language", "YAML Ain't Markup Language", "Young Abstract Markup Language", "YAML And Machine Learning"], correctAnswer: "YAML Ain't Markup Language" },
            { question: "What is crucial for defining structure in YAML?", options: ["Brackets", "Commas", "Indentation", "Quotation marks"], correctAnswer: "Indentation" },
            { question: "What character denotes a list item (sequence) in YAML?", options: ["*", "-", "+", ">"], correctAnswer: "-" },
            { question: "What character separates a key from a value?", options: ["=", "->", ":", "=>"], correctAnswer: ":" },
            { question: "How do you write a comment in YAML?", options: ["// comment", "/* comment */", "<!-- comment -->", "# comment"], correctAnswer: "# comment" },
            { question: "Are quotes required for string values in YAML?", options: ["Yes, always", "No, but they can be used", "Only for multi-word strings", "Only for keys"], correctAnswer: "No, but they can be used" },
            { question: "YAML is commonly used for what type of files?", options: ["Image files", "Video files", "Configuration files", "Binary executables"], correctAnswer: "Configuration files" },
            { question: "A collection of key-value pairs in YAML is called a...", options: ["Sequence", "List", "Array", "Mapping"], correctAnswer: "Mapping" },
            { question: "A list of items in YAML is called a...", options: ["Mapping", "Object", "Sequence", "Dictionary"], correctAnswer: "Sequence" },
        ],
        medium: [
            { question: "How do you represent a multi-line string in YAML that preserves newlines?", options: ["Using the pipe `|` character", "Using the greater-than `>` character", "By enclosing it in triple quotes", "By adding \\n manually"], correctAnswer: "Using the pipe `|` character" },
            { question: "When prompting an LLM for a list of steps in YAML, which character would you expect on each line?", options: ["*", ">", "-", "."], correctAnswer: "-" },
            { question: "How do you represent a boolean `true` in YAML?", options: ["Only 'true'", "Only 'True'", "Only 'TRUE'", "true, True, or TRUE are all valid"], correctAnswer: "true, True, or TRUE are all valid" },
            { question: "What are an 'anchor' (`&`) and 'alias' (`*`) used for in YAML?", options: ["For web links", "To bold text", "To avoid repeating data", "To create comments"], correctAnswer: "To avoid repeating data" },
            { question: "Compared to JSON, YAML is generally...", options: ["More verbose", "Stricter with syntax", "Less verbose and uses indentation instead of brackets", "Harder for humans to read"], correctAnswer: "Less verbose and uses indentation instead of brackets" },
            { question: "Why might an LLM struggle to generate correct YAML?", options: ["It finds YAML boring", "Incorrect indentation is a common error", "YAML has too many brackets", "The syntax is too simple"], correctAnswer: "Incorrect indentation is a common error" },
            { question: "What is a good strategy to make an LLM generate valid YAML?", options: ["Use very complex words", "Provide a clear example (few-shot) with correct indentation", "Ask it to hurry up", "Don't give it any instructions"], correctAnswer: "Provide a clear example (few-shot) with correct indentation" },
            { question: "What does `---` signify in a YAML file?", options: ["The end of the file", "A major error", "The start of a document", "A horizontal line"], correctAnswer: "The start of a document" },
            { question: "How would you prompt an LLM to create a config for a web server in YAML?", options: ["Ask for 'server stuff'", "Specify the required keys like `port`, `host`, and `timeout`", "Tell it to 'make a config'", "Give it a link to a website"], correctAnswer: "Specify the required keys like `port`, `host`, and `timeout`" },
            { question: "Can you include a JSON object inside a YAML file?", options: ["No, it will cause an error", "Yes, YAML is a superset of JSON", "Only if the JSON is very small", "Only if you convert it to XML first"], correctAnswer: "Yes, YAML is a superset of JSON" },
        ],
        xone: [
            { question: "How does YAML's handling of whitespace differ from JSON's?", options: ["They are identical", "In YAML, whitespace and indentation are syntactically significant", "JSON uses whitespace for comments", "YAML ignores all whitespace"], correctAnswer: "In YAML, whitespace and indentation are syntactically significant" },
            { question: "What is a 'folded' block scalar (using `>`) in YAML?", options: ["It makes the text bold", "It converts newlines to spaces, but preserves blank lines", "It deletes the text block", "It creates a hyperlink"], correctAnswer: "It converts newlines to spaces, but preserves blank lines" },
            { question: "For an LLM generating a Kubernetes config, why is YAML a better choice than JSON?", options: ["It's more colorful", "YAML's structure is closer to how humans write configs, making the prompt easier", "It uses fewer tokens", "It runs faster"], correctAnswer: "YAML's structure is closer to how humans write configs, making the prompt easier" },
            { question: "What's a potential ambiguity in YAML an LLM might get wrong?", options: ["Using too many comments", "Unquoted strings like 'NO' could be interpreted as a boolean `false`", "The file is too long", "The indentation is too perfect"], correctAnswer: "Unquoted strings like 'NO' could be interpreted as a boolean `false`" },
            { question: "To prevent an LLM from misinterpreting a string as a number in YAML, you should instruct it to...", options: ["Use all capital letters", "Enclose all string values in quotes", "Add a comment explaining it's a string", "Avoid using numbers in strings"], correctAnswer: "Enclose all string values in quotes" },
            { question: "What is a 'tag' (e.g., `!!str`) in YAML used for?", options: ["To add a CSS tag", "To explicitly specify the data type of a value", "To tag a user in a comment", "To create a placeholder"], correctAnswer: "To explicitly specify the data type of a value" },
            { question: "When using 'Chain of Thought' to generate a YAML config, what is a good first step?", options: ["Generate the YAML immediately", "Ask the LLM to list the required config sections and their keys", "Ask for a joke", "Ask for the weather"], correctAnswer: "Ask the LLM to list the required config sections and their keys" },
            { question: "A key in a YAML mapping can itself be a complex structure, like a list.", options: ["True", "False"], correctAnswer: "True" },
            { question: "How can providing a persona (e.g., 'act as a senior DevOps engineer') help an LLM generate better YAML?", options: ["It doesn't help at all", "It provides context and biases the model towards generating conventional, high-quality output", "It makes the output longer", "It slows down the generation process"], correctAnswer: "It provides context and biases the model towards generating conventional, high-quality output" },
            { question: "What's a key challenge for an LLM when generating YAML compared to XML?", options: ["XML is harder to read", "YAML has no challenges", "Maintaining consistent indentation across nested structures", "Choosing the right tag names"], correctAnswer: "Maintaining consistent indentation across nested structures" },
        ],
    }
};
