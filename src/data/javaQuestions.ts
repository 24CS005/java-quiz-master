export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export const javaQuestions: Question[] = [
  {
    id: 1,
    question: "What is the default value of a boolean variable in Java?",
    options: ["true", "false", "null", "0"],
    correctAnswer: "false",
    explanation: "In Java, the default value of a boolean variable is false."
  },
  {
    id: 2,
    question: "Which keyword is used to define a constant in Java?",
    options: ["const", "final", "static", "constant"],
    correctAnswer: "final",
    explanation: "The 'final' keyword is used to declare constants in Java."
  },
  {
    id: 3,
    question: "What is the size of an int variable in Java?",
    options: ["2 bytes", "4 bytes", "8 bytes", "Depends on the system"],
    correctAnswer: "4 bytes",
    explanation: "In Java, an int is always 4 bytes (32 bits) regardless of the system."
  },
  {
    id: 4,
    question: "Which method is the entry point of a Java program?",
    options: ["start()", "run()", "main()", "init()"],
    correctAnswer: "main()",
    explanation: "The main() method is the entry point for any Java application."
  },
  {
    id: 5,
    question: "What is the parent class of all classes in Java?",
    options: ["Object", "Class", "Super", "Parent"],
    correctAnswer: "Object",
    explanation: "The Object class is the root of the class hierarchy in Java."
  },
  {
    id: 6,
    question: "Which of these is not a primitive data type in Java?",
    options: ["int", "float", "String", "char"],
    correctAnswer: "String",
    explanation: "String is a class in Java, not a primitive data type."
  },
  {
    id: 7,
    question: "What does JVM stand for?",
    options: ["Java Virtual Machine", "Java Variable Method", "Java Visual Machine", "Java Verified Machine"],
    correctAnswer: "Java Virtual Machine",
    explanation: "JVM stands for Java Virtual Machine, which executes Java bytecode."
  },
  {
    id: 8,
    question: "Which operator is used to allocate memory for an object in Java?",
    options: ["malloc", "alloc", "new", "create"],
    correctAnswer: "new",
    explanation: "The 'new' keyword is used to create new objects and allocate memory."
  },
  {
    id: 9,
    question: "What is the correct way to declare an array in Java?",
    options: ["int arr[];", "int[] arr;", "array int arr;", "Both A and B"],
    correctAnswer: "Both A and B",
    explanation: "Both 'int arr[]' and 'int[] arr' are valid array declarations in Java."
  },
  {
    id: 10,
    question: "Which access modifier makes a member accessible only within its own class?",
    options: ["public", "protected", "private", "default"],
    correctAnswer: "private",
    explanation: "The 'private' access modifier restricts access to the same class only."
  },
  {
    id: 11,
    question: "What is the output of 10 + 20 + \"Hello\" in Java?",
    options: ["1020Hello", "30Hello", "Hello1020", "Error"],
    correctAnswer: "30Hello",
    explanation: "Numbers are added first (10+20=30), then concatenated with the string."
  },
  {
    id: 12,
    question: "Which loop is guaranteed to execute at least once?",
    options: ["for loop", "while loop", "do-while loop", "for-each loop"],
    correctAnswer: "do-while loop",
    explanation: "The do-while loop checks the condition after executing the body."
  },
  {
    id: 13,
    question: "What does the 'static' keyword mean in Java?",
    options: ["Variable cannot be changed", "Member belongs to the class", "Method is private", "Variable is constant"],
    correctAnswer: "Member belongs to the class",
    explanation: "Static members belong to the class rather than instances of the class."
  },
  {
    id: 14,
    question: "Which exception is thrown when dividing by zero in integer arithmetic?",
    options: ["NullPointerException", "ArithmeticException", "NumberFormatException", "IllegalArgumentException"],
    correctAnswer: "ArithmeticException",
    explanation: "ArithmeticException is thrown for arithmetic errors like division by zero."
  },
  {
    id: 15,
    question: "What is method overloading in Java?",
    options: ["Same method name with different parameters", "Same method in parent and child class", "Calling a method multiple times", "None of the above"],
    correctAnswer: "Same method name with different parameters",
    explanation: "Method overloading allows multiple methods with the same name but different parameters."
  },
  {
    id: 16,
    question: "Which keyword is used to inherit a class in Java?",
    options: ["implements", "extends", "inherits", "super"],
    correctAnswer: "extends",
    explanation: "The 'extends' keyword is used for class inheritance in Java."
  },
  {
    id: 17,
    question: "What is the default value of a reference variable in Java?",
    options: ["0", "undefined", "null", "empty"],
    correctAnswer: "null",
    explanation: "Reference variables default to null if not explicitly initialized."
  },
  {
    id: 18,
    question: "Which collection class allows duplicate elements?",
    options: ["HashSet", "TreeSet", "ArrayList", "HashMap"],
    correctAnswer: "ArrayList",
    explanation: "ArrayList allows duplicate elements, while Set implementations do not."
  },
  {
    id: 19,
    question: "What is encapsulation in Java?",
    options: ["Hiding implementation details", "Inheriting from multiple classes", "Method overriding", "Creating objects"],
    correctAnswer: "Hiding implementation details",
    explanation: "Encapsulation is the bundling of data with methods that operate on that data."
  },
  {
    id: 20,
    question: "Which interface must be implemented for custom sorting in Java?",
    options: ["Sortable", "Comparable", "Comparator", "Both B and C"],
    correctAnswer: "Both B and C",
    explanation: "Both Comparable and Comparator interfaces can be used for custom sorting."
  },
  {
    id: 21,
    question: "What is the purpose of the 'this' keyword in Java?",
    options: ["Reference to current object", "Reference to parent class", "Create new object", "Define static method"],
    correctAnswer: "Reference to current object",
    explanation: "The 'this' keyword refers to the current instance of the class."
  },
  {
    id: 22,
    question: "Which statement is used to exit from a loop prematurely?",
    options: ["continue", "break", "exit", "return"],
    correctAnswer: "break",
    explanation: "The 'break' statement exits the loop immediately."
  },
  {
    id: 23,
    question: "What is a constructor in Java?",
    options: ["A method to destroy objects", "A special method to initialize objects", "A variable declaration", "An interface"],
    correctAnswer: "A special method to initialize objects",
    explanation: "Constructors are special methods called when an object is created."
  },
  {
    id: 24,
    question: "Which class is used for reading character-based data from a file?",
    options: ["FileInputStream", "FileReader", "BufferedInputStream", "DataInputStream"],
    correctAnswer: "FileReader",
    explanation: "FileReader is designed for reading character streams from files."
  },
  {
    id: 25,
    question: "What does the 'super' keyword do in Java?",
    options: ["Creates a superclass", "Refers to parent class members", "Makes a class abstract", "Implements an interface"],
    correctAnswer: "Refers to parent class members",
    explanation: "The 'super' keyword is used to access parent class members."
  },
  {
    id: 26,
    question: "Which of these is a marker interface in Java?",
    options: ["Runnable", "Serializable", "Comparable", "Cloneable"],
    correctAnswer: "Serializable",
    explanation: "Serializable is a marker interface with no methods to implement."
  },
  {
    id: 27,
    question: "What is polymorphism in Java?",
    options: ["One class inheriting another", "Object taking many forms", "Hiding data members", "Creating multiple constructors"],
    correctAnswer: "Object taking many forms",
    explanation: "Polymorphism allows objects to be treated as instances of their parent class."
  },
  {
    id: 28,
    question: "Which keyword prevents a class from being inherited?",
    options: ["static", "abstract", "final", "private"],
    correctAnswer: "final",
    explanation: "A final class cannot be subclassed in Java."
  },
  {
    id: 29,
    question: "What is the output of 'System.out.println(1 + 2 + \"3\")' in Java?",
    options: ["123", "33", "6", "Error"],
    correctAnswer: "33",
    explanation: "1+2 is evaluated first (=3), then concatenated with \"3\" to give \"33\"."
  },
  {
    id: 30,
    question: "Which method is used to start a thread in Java?",
    options: ["run()", "start()", "execute()", "begin()"],
    correctAnswer: "start()",
    explanation: "The start() method is used to begin thread execution."
  },
  {
    id: 31,
    question: "What is an abstract class in Java?",
    options: ["A class that cannot be instantiated", "A class with only static methods", "A class without constructors", "A final class"],
    correctAnswer: "A class that cannot be instantiated",
    explanation: "Abstract classes cannot be instantiated and may contain abstract methods."
  },
  {
    id: 32,
    question: "Which package is automatically imported in every Java program?",
    options: ["java.util", "java.io", "java.lang", "java.awt"],
    correctAnswer: "java.lang",
    explanation: "The java.lang package is imported by default in all Java programs."
  },
  {
    id: 33,
    question: "What is the difference between == and .equals() in Java?",
    options: ["No difference", "== compares references, equals() compares values", "== compares values, equals() compares references", "Both compare only primitives"],
    correctAnswer: "== compares references, equals() compares values",
    explanation: "== checks reference equality while .equals() checks value equality."
  },
  {
    id: 34,
    question: "Which of these is NOT a valid Java identifier?",
    options: ["_variable", "$money", "123abc", "myVar"],
    correctAnswer: "123abc",
    explanation: "Java identifiers cannot start with a digit."
  },
  {
    id: 35,
    question: "What is autoboxing in Java?",
    options: ["Converting object to primitive", "Converting primitive to object", "Creating wrapper classes", "Boxing arrays"],
    correctAnswer: "Converting primitive to object",
    explanation: "Autoboxing automatically converts primitives to their wrapper classes."
  },
  {
    id: 36,
    question: "Which collection class uses key-value pairs?",
    options: ["ArrayList", "LinkedList", "HashMap", "HashSet"],
    correctAnswer: "HashMap",
    explanation: "HashMap stores data as key-value pairs."
  },
  {
    id: 37,
    question: "What is the purpose of the finally block?",
    options: ["Execute code if exception occurs", "Execute code regardless of exception", "Catch specific exceptions", "Throw exceptions"],
    correctAnswer: "Execute code regardless of exception",
    explanation: "The finally block always executes, whether an exception occurs or not."
  },
  {
    id: 38,
    question: "Which keyword is used to handle exceptions in Java?",
    options: ["try", "catch", "throw", "All of the above"],
    correctAnswer: "All of the above",
    explanation: "try, catch, and throw are all used in exception handling."
  },
  {
    id: 39,
    question: "What is the range of byte data type in Java?",
    options: ["-128 to 127", "0 to 255", "-256 to 255", "-127 to 128"],
    correctAnswer: "-128 to 127",
    explanation: "A byte in Java is a signed 8-bit integer ranging from -128 to 127."
  },
  {
    id: 40,
    question: "Which method converts a string to lowercase in Java?",
    options: ["toLower()", "toLowerCase()", "lower()", "convertToLower()"],
    correctAnswer: "toLowerCase()",
    explanation: "The toLowerCase() method converts all characters to lowercase."
  }
];

export function getRandomQuestions(questions: Question[], count: number): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
