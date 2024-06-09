function replaceStringComparisons(text, baseObjPath) {
  const c = {
    sw: {
      regex: new RegExp(/[^\(\s]+\s+sw\s+(.*?'.*?)'+/, "g"),
      regex1: new RegExp(/[^\(\s]+\s+sw\s+/, "g"),
      replaceWith: "startsWith",
    },
    ew: {
      regex: new RegExp(/[^\(\s]+\s+ew\s+(.*?'.*?)'+/, "g"),
      regex1: new RegExp(/[^\(\s]+\s+ew\s+/, "g"),
      replaceWith: "endsWith",
    },
    so: {
      regex: new RegExp(/[^\(\s]+\s+so\s+(.*?'.*?)'+/, "g"),
      regex1: new RegExp(/[^\(\s]+\s+so\s+/, "g"),
      replaceWith: "includes",
    },
  };

  Object.entries(c).map(([key, value]) => {
    const f = text.match(value.regex1);

    if (f) {
      f.map((f1) => {
        const f2 = f1[0].split(` ${key}`).filter((f3) => f3.trim() != "");

        const f3 = f1.replace(f2[0], `${baseObjPath}.${f2[0]}`);
        text = text.replace(f1, f3);
      });
    }

    const items = text.match(value.regex);

    if (items)
      items.map((item) => {
        let [f, v] = item.split(` ${key} `);
        text = text.replace(item, `${f}.${value.replaceWith}(${v})`);
      });
  });

  return text;
}

function replaceMathComparisons(text, baseObjPath) {
  const c = {
    eq: {
      regex: new RegExp(/(?:\s*eq\s*)+/, "g"),
      regex1: new RegExp(/[^\(\s]+\s+eq\s+/, "g"),
      replaceWith: " == ",
    },
    ne: {
      regex: new RegExp(/(?:\s*ne\s*)+/, "g"),
      regex1: new RegExp(/[^\(\s]+\s+ne\s+/, "g"),
      replaceWith: " != ",
    },
    gt: {
      regex: new RegExp(/(?:\s*gt\s*)+/, "g"),
      regex1: new RegExp(/[^\(\s]+\s+gt\s+/, "g"),
      replaceWith: " > ",
    },
    ge: {
      regex: new RegExp(/(?:\s*ge\s*)+/, "g"),
      regex1: new RegExp(/[^\(\s]+\s+ge\s+/, "g"),
      replaceWith: " >= ",
    },
    lt: {
      regex: new RegExp(/(?:\s*lt\s*)+/, "g"),
      regex1: new RegExp(/[^\(\s]+\s+lt\s+/, "g"),
      replaceWith: " < ",
    },
    le: {
      regex: new RegExp(/(?:\s*le\s*)+/, "g"),
      regex1: new RegExp(/[^\(\s]+\s+le\s+/, "g"),
      replaceWith: " <= ",
    },
  };

  Object.entries(c).map(([key, value]) => {
    const f = text.match(value.regex1);
    if (f) {
      f.map((f1) => {
        const f2 = f1.split(" eq").filter((f3) => f3.trim() != "");
        const f3 = f1.replace(f2[0], `${baseObjPath}.${f2[0]}`);
        text = text.replace(f1, f3);
      });
    }

    text = text.replace(value.regex, value.replaceWith);
  });

  return text;
}

function replaceOperations(text) {
  const c = {
    and: {
      regex: new RegExp(/(?:\s*and\s*)+/, "g"),
      replaceWith: " && ",
    },
    or: {
      regex: new RegExp(/(?:\s*or\s*)+/, "g"),
      replaceWith: " || ",
    },
  };

  Object.entries(c).map(([key, value]) => {
    text = text.replace(value.regex, value.replaceWith);
  });

  return text;
}

export function parseFilter(filter, baseObjPath) {
  filter = replaceStringComparisons(filter, baseObjPath);
  filter = replaceMathComparisons(filter, baseObjPath);
  filter = replaceOperations(filter);

  return filter;
}
