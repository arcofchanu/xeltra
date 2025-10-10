export type ResourceItem = {
    type: 'heading' | 'paragraph' | 'bullet' | 'code';
    content: string;
};

type ResourceData = {
    [topic: string]: ResourceItem[];
};

export const resourceData: ResourceData = {
    "XML": [
        { type: 'heading', content: 'Crafting Effective XML Prompts' },
        { type: 'paragraph', content: 'XML (Extensible Markup Language) is ideal for giving an LLM highly structured, hierarchical tasks. Its tag-based format allows you to clearly separate different parts of your prompt, such as instructions, context, and examples. This reduces ambiguity and helps the model understand complex requests.' },
        { type: 'heading', content: 'Key Principles' },
        { type: 'bullet', content: 'Be Explicit: Use clear, descriptive tag names (e.g., `<task>`, `<persona>`, `<constraints>`).' },
        { type: 'bullet', content: 'Provide Structure: Nest tags logically to show relationships between different pieces of information.' },
        { type: 'bullet', content: 'Use Few-Shot Examples: For complex outputs, include a complete example of the desired XML structure within `<example>` tags.' },
        { type: 'heading', content: 'Example: Role-Playing Prompt' },
        { type: 'paragraph', content: 'You can instruct the LLM to adopt a persona. This is highly effective for generating text in a specific style or from a particular viewpoint.' },
        { type: 'code', content: 
`<prompt>
  <persona>
    You are a skeptical 18th-century historian. Your tone is academic, critical, and you often question the reliability of sources.
  </persona>
  <task>
    Write a brief analysis of the invention of the smartphone, as if you were observing it from your historical perspective.
  </task>
</prompt>` 
        },
        { type: 'heading', content: 'Example: Constrained Generation' },
        { type: 'paragraph', content: 'Use tags to set clear constraints on the output, which helps guide the model and prevent irrelevant responses.' },
        { type: 'code', content:
`<prompt>
  <task>
    Generate a list of three potential names for a new coffee shop.
  </task>
  <constraints>
    <style>Modern and minimalist</style>
    <must_contain>The word "Bean" or "Brew"</must_contain>
    <must_not_contain>The word "Express" or "Quick"</must_not_contain>
  </constraints>
  <output_format>
    A simple XML structure with a root <names> element and three <name> children.
  </output_format>
</prompt>`
        }
    ],
    "JSON": [
        { type: 'heading', content: 'Crafting Effective JSON Prompts' },
        { type: 'paragraph', content: 'JSON (JavaScript Object Notation) is a lightweight and easy-to-parse format, making it perfect for requesting structured data from an LLM that can be directly used in applications. Use key-value pairs to define your request clearly.' },
        { type: 'heading', content: 'Key Principles' },
        { type: 'bullet', content: 'Define the Schema: Use keys to describe the data you need (e.g., "name", "email", "tags").' },
        { type: 'bullet', content: 'Use Data Types: Structure your prompt to show whether you expect strings, numbers, booleans, arrays, or nested objects.' },
        { type: 'bullet', content: 'Request Valid JSON: Explicitly ask the model to "generate a valid JSON object" to minimize syntax errors like trailing commas.' },
        { type: 'heading', content: 'Example: Data Extraction' },
        { type: 'paragraph', content: 'Provide unstructured text and ask the LLM to extract specific information into a clean JSON object.' },
        { type: 'code', content: 
`{
  "context": "The event is on August 15, 2024, at the Grand Hall. Tickets are $25. The main speaker will be Jane Doe, a leading expert in AI ethics.",
  "task": "Extract the key details from the context above into a valid JSON object.",
  "desired_output_schema": {
    "eventName": "string",
    "date": "string (YYYY-MM-DD)",
    "location": "string",
    "price": "number",
    "speaker": "string"
  }
}` 
        },
        { type: 'heading', content: 'Example: Few-Shot List Generation' },
        { type: 'paragraph', content: 'Provide an example to guide the model on the exact structure for items in a list.' },
        { type: 'code', content:
`{
  "task": "Generate a list of three fictional books with their authors and genres.",
  "examples": [
    {
      "title": "The Quantum Serpent",
      "author": "Elara Vance",
      "genre": "Sci-Fi"
    }
  ],
  "output_format": "A JSON array containing three objects structured like the example."
}`
        }
    ],
    "YAML": [
        { type: 'heading', content: 'Crafting Effective YAML Prompts' },
        { type: 'paragraph', content: "YAML (YAML Ain't Markup Language) is prized for its human-readability. Its indentation-based structure makes it excellent for configuration files and for prompts where the hierarchy of information is important. It's less cluttered than XML or JSON." },
        { type: 'heading', content: 'Key Principles' },
        { type: 'bullet', content: 'Indentation is Key: Ensure your examples and instructions use correct and consistent indentation (usually 2 spaces).' },
        { type: 'bullet', content: 'Use Sequences for Lists: Use a hyphen-dash (-) for items in a list.' },
        { type: 'bullet', content: 'Use Mappings for Objects: Use key: value pairs for objects.' },
        { type: 'heading', content: 'Example: Generating Configuration' },
        { type: 'paragraph', content: "YAML is the standard for many configuration files, like those in Kubernetes or GitHub Actions. You can ask an LLM to generate one based on high-level requirements." },
        { type: 'code', content: 
`# Task: Generate a basic YAML configuration for a simple web application deployment.

# Requirements:
# - The application is named 'my-app'.
# - It uses the 'nginx:latest' docker image.
# - It needs 3 replicas.
# - It should be exposed on port 80.

# Desired Output: A valid Kubernetes deployment YAML file.` 
        },
        { type: 'heading', content: 'Example: Creating a Structured List' },
        { type: 'paragraph', content: 'Use YAML to request structured outlines, plans, or lists that are easy for humans to read.' },
        { type: 'code', content:
`# Task: Create a 3-step marketing plan for a new mobile game.

# For each step, provide:
# - A 'name' for the step.
# - A brief 'description'.
# - A list of 'channels' to use (e.g., 'Social Media', 'Email', 'Influencers').

# Output Format: A YAML sequence where each item is a mapping with the specified keys.`
        }
    ]
};